import { AppLogo } from "@/components/layout/app-logo";
import { NavigationDropdown } from "@/components/layout/navigation-dropdown";

export const MobileTopBar = () => {
  return (
    <div className="md:hidden sticky top-0 z-30 bg-background/90 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex flex-1" aria-hidden="true" />
        <div className="flex flex-1 justify-center">
          <AppLogo />
        </div>
        <div className="flex flex-1 justify-end">
          <NavigationDropdown />
        </div>
      </div>
    </div>
  );
};
