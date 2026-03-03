import type { Register } from 'react-router';

type ApiRoutePaths = {
  [K in keyof Register['routeFiles']]: K extends `routes/_api/${string}/route.ts`
    ? Register['routeFiles'][K] extends { page: infer P }
      ? P extends string
        ? P extends `/api/${infer Path}`
          ? Path
          : never
        : never
      : never
    : never;
}[keyof Register['routeFiles']];

type ApiRouteId<P extends ApiRoutePaths> = {
  [K in keyof Register['routeFiles']]: K extends `routes/_api/${string}/route.ts`
    ? Register['routeFiles'][K] extends { page: infer PageUnion; id: infer ID }
      ? PageUnion extends string
        ? PageUnion extends `/api/${P}`
          ? ID
          : never
        : never
      : never
    : never;
}[keyof Register['routeFiles']];

type ApiRoute<P extends ApiRoutePaths> = Register['routeModules'][ApiRouteId<P>];

type ApiRouteQueryResult<P extends ApiRoutePaths> =
  ApiRoute<P> extends {
    loader: (...args: never[]) => infer R;
  }
    ? Awaited<R>
    : never;

type ApiRouteMutationResult<P extends ApiRoutePaths> =
  ApiRoute<P> extends {
    action: (...args: never[]) => infer R;
  }
    ? Awaited<R>
    : never;

type ApiRouteActionInput<P extends ApiRoutePaths> =
  ApiRoute<P> extends {
    ActionInput: infer I;
  }
    ? I
    : unknown;

export type { ApiRoute, ApiRouteQueryResult, ApiRouteMutationResult, ApiRoutePaths, ApiRouteActionInput };
