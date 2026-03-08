import { DollarSign, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketplaceStore } from "@/stores/marketplace-store";

export function CreatorDashboard() {
  const { myListings, mySales } = useMarketplaceStore();

  const totalRevenue = mySales.reduce((s, p) => s + Number(p.creator_payout), 0);
  const totalSales = mySales.length;
  const avgPrice = myListings.length
    ? (myListings.reduce((s, l) => s + Number(l.price), 0) / myListings.length).toFixed(2)
    : "0";
  const conversionRate = myListings.length
    ? ((totalSales / Math.max(myListings.reduce((s, l) => s + l.sales_count + 10, 0), 1)) * 100).toFixed(1)
    : "0";

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
    { label: "Total Sales", value: totalSales, icon: ShoppingCart, color: "text-primary" },
    { label: "Avg. Price", value: `$${avgPrice}`, icon: BarChart3, color: "text-amber-500" },
    { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Creator Dashboard</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {myListings.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">My Listings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {myListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">{listing.sales_count} sales</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {listing.price > 0 ? `$${listing.price}` : "Free"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
