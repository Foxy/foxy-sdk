import { APINode, APINodeParameters } from "./APINode";
import { Flatten, Graph, IntersectionOfValues, Query, RequiredPropertyOf, ResponseJSON, ZoomIn } from "./types";

type APIResponseNodeParameters<G extends Graph, Q> = Omit<APINodeParameters, "path"> & {
  json: ResponseJSON<G, Q>;
};

type ZoomedResponseNodes<G extends Graph, Q> = Q extends Query<G>
  ? IntersectionOfValues<
      {
        [TRel in Flatten<Q["zoom"]> | RequiredPropertyOf<G["zooms"]>]: Record<
          Required<G["zooms"]>[TRel]["curie"],
          Required<G["zooms"]>[TRel]["child"] extends Graph
            ? APIResponseNode<Required<G["zooms"]>[TRel]["child"], { zoom: ZoomIn<Q["zoom"], TRel> }>[]
            : APIResponseNode<Required<G["zooms"]>[TRel], { zoom: ZoomIn<Q["zoom"], TRel> }>
        >;
      }
    >
  : IntersectionOfValues<
      {
        [TRel in RequiredPropertyOf<G["zooms"]>]: Record<
          Required<G["zooms"]>[TRel]["curie"],
          Required<G["zooms"]>[TRel]["child"] extends Graph
            ? APIResponseNode<Required<G["zooms"]>[TRel]["child"]>[]
            : APIResponseNode<Required<G["zooms"]>[TRel]>
        >;
      }
    >;

type CollectionItems<G extends Graph, Q> = G["child"] extends Graph
  ? Record<G["curie"], APIResponseNode<G["child"], Q>[]>
  : unknown;

type Zoom<G extends Graph, Q = undefined> = G["child"] extends Graph
  ? CollectionItems<G, Q>
  : ZoomedResponseNodes<G, Q>;

class APIResponseNode<G extends Graph, Q = undefined> extends APINode<G> {
  readonly embeds: Zoom<G, Q>;
  readonly props: G["props"];

  constructor({ resolve, fetch, json }: APIResponseNodeParameters<G, Q>) {
    super({ resolve, fetch, path: [new URL(json._links.self.href)] });

    this.embeds = Object.entries(json._embedded).reduce((p, [key, value]) => {
      return {
        ...p,
        [key]: Array.isArray(value)
          ? value.map((n) => new APIResponseNode({ resolve, fetch, json: n }))
          : new APIResponseNode({ resolve, fetch, json: value }),
      };
    }, {}) as Zoom<G, Q>;

    this.props = json;
  }
}

export { APIResponseNode };
