import SideMenu from "@/app/components/SideMenu";

export default function Course({ course }) {
  return (
    <>
        <div className="flex">
      <div className="w-4/10 bg-red-500">
    <SideMenu />
    </div>
      <div className="w-6/10 bg-blue-500">
      </div>
    </div>
    </>
  );
}