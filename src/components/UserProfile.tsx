import { useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Camera, Save, X as XIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function UserProfile() {
  const { profile, uploadAvatar, updateProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [expertise, setExpertise] = useState<string[]>(profile?.expertise ?? []);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    setUploading(true);
    const { error } = await uploadAvatar(file);
    setUploading(false);
    if (error) toast.error(error);
    else toast.success("Avatar updated!");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName, bio, expertise });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("Profile saved!");
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !expertise.includes(tag)) {
      setExpertise([...expertise, tag]);
      setNewTag("");
    }
  };

  return (
    <Card className="border-border">
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {fullName?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={uploading}
            >
              <Camera className="w-5 h-5 text-foreground" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="font-medium text-foreground">{profile?.full_name}</p>
            <Badge variant="secondary" className="mt-1 capitalize">{profile?.plan} plan</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." />
        </div>

        <div className="space-y-2">
          <Label>Expertise Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {expertise.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => setExpertise(expertise.filter((t) => t !== tag))}>
                  <XIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <Button variant="outline" size="icon" onClick={addTag}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        <Button variant="gradient" onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
