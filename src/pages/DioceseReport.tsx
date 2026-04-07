/**
 * DioceseReport — Mission Report for bishops, diocese, and sponsoring religious orders.
 *
 * "The first product that turns Catholic identity from an assertion into evidence."
 *
 * Generated from actual pastoral care data: visits, sacraments, family engagement,
 * volunteer participation. Designed to be printed and presented.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Cross, Heart, BookOpen, Users, BarChart3 } from 'lucide-react';
import { useDioceseReport } from '@/hooks/useDioceseReport';

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  );
}

function SacramentRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{count}</span>
    </div>
  );
}

export default function DioceseReport() {
  const { data: report, isLoading } = useDioceseReport();

  return (
    <MainLayout title="Mission Report" subtitle="Diocese & Sponsor Reporting">
      <div className="max-w-4xl mx-auto space-y-8 pb-16 print:max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Mission Report
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {report?.periodLabel ?? 'Current Season'} &middot; Generated {new Date().toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Mission Report
          </h1>
          <p className="text-lg text-gray-600 mt-2">{report?.periodLabel}</p>
          <p className="text-sm text-gray-500">Generated {new Date().toLocaleDateString()}</p>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading report data...</p>}

        {report && (
          <>
            {/* Section 1: Pastoral Care */}
            <section>
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Pastoral Care Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Visits" value={report.totalVisits} icon={Heart} />
                <StatCard label="Residents Visited" value={report.uniqueResidentsVisited} icon={Users} sub={`of ${report.totalResidents} total`} />
                <StatCard label="Unique Visitors" value={report.uniqueVisitors} icon={Users} sub="staff, chaplains, volunteers" />
                <StatCard label="Avg Visits / Resident" value={report.avgVisitsPerResident} icon={BarChart3} />
              </div>
            </section>

            {/* Section 2: Sacramental Life */}
            <section>
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <Cross className="h-4 w-4" />
                Sacramental Life
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
                      Sacraments Administered
                    </p>
                    <SacramentRow label="Holy Communion" count={report.communionCount} />
                    <SacramentRow label="Confession / Reconciliation" count={report.confessionCount} />
                    <SacramentRow label="Anointing of the Sick" count={report.anointingCount} />
                    <SacramentRow label="Last Rites" count={report.lastRitesCount} />
                    <SacramentRow label="Rosary" count={report.rosaryCount} />
                    <SacramentRow label="Blessings" count={report.blessingCount} />
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-border font-semibold text-sm">
                      <span>Total</span>
                      <span>{report.totalSacraments}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 flex flex-col justify-center h-full">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                      Sacramental Coverage
                    </p>
                    <p className="text-5xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {report.sacramentalCoveragePercent}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of residents received at least one sacrament this season
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 3: Family Engagement */}
            <section>
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Family Engagement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Reflections Published" value={report.reflectionsPublished} icon={BookOpen} sub="AI-composed from visit data" />
                <StatCard label="Journals Printed" value={report.journalsPrinted} icon={Printer} sub="seasonal booklets via Lulu" />
                <StatCard label="Journals Shipped" value={report.journalsShipped} icon={Heart} sub="delivered to families" />
              </div>
            </section>

            {/* Section 4: Community */}
            <section>
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community &amp; Volunteers
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Active Volunteers" value={report.activeVolunteers} icon={Users} sub="parish and community" />
                <StatCard label="Total Residents" value={report.totalResidents} icon={Heart} sub="in care" />
              </div>
            </section>

            {/* Section 5: ERD Compliance Note */}
            <section className="print:break-before-page">
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Ethical &amp; Religious Directives Compliance
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    This report is generated in support of the Ethical and Religious Directives
                    for Catholic Health Care Services (7th Edition, USCCB 2025). Data reflects
                    documented pastoral care, sacramental administration, and family engagement
                    during the reporting period. All spiritual care interactions are recorded
                    through Vigilia's structured visit ritual by staff, chaplains, and volunteers.
                    Sacramental records are maintained with date, type, and minister documentation.
                  </p>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
}
