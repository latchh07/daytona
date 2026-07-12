import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import LiveOrchestrator from "@/components/LiveOrchestrator";
import PublicLeaderboard from "@/components/PublicLeaderboard";
import ReplayViewer from "@/components/ReplayViewer";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopNavBar />
      <SideNavBar />
      <main className="ml-64 pt-16 pb-8 px-margin-page min-h-screen flex flex-col gap-stack-gap">
        <div className="grid grid-cols-12 gap-gutter mt-4">
          <LiveOrchestrator />
          <PublicLeaderboard />
        </div>
        <ReplayViewer />
      </main>
      <Footer />
    </>
  );
}
