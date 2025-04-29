import {
  createApp as createClientApp,
  resolveDynamicComponent,
  h,
  VNode,
  Transition,
} from "vue";

import { RouterView } from "vue-router";
import { createRouter } from "./router";

async function createApp() {
  const router = createRouter();

  const app = createClientApp({
    setup() {
      return () => {
        const defaultSlot = ({ Component: _Component }: any) => {
          const Component = resolveDynamicComponent(_Component) as VNode;

          return [
            h(
              Transition,
              {
                name: "fade-slow",
                mode: "out-in",
              },
              {
                default: () => [h(Component)],
              }
            ),
          ];
        };

        return [
          h(RouterView, null, {
            default: defaultSlot,
          }),
        ];
      };
    },
  });

  // packages use
  app.use(router);

  return app;
}

createApp().then((app) => app.mount("#app"));
