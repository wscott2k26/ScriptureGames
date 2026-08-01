export type BackCapableRouter = {
  canGoBack?: () => boolean;
  back: () => void;
  replace: (href: string) => void;
};

export function goBackOrHome(router: BackCapableRouter) {
  if (router.canGoBack?.()) {
    router.back();
    return;
  }
  router.replace('/(tabs)/command');
}
