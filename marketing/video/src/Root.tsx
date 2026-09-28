import { Composition, staticFile } from "remotion";
import { Ad } from "./Ad";
import type { AdData } from "./types";

/* id = "<version>_<lang>" → public/props/<id>.json (נוצר ב-prepare.js) */
export const Root: React.FC = () => (
  <Composition
    id="Ad"
    component={Ad}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={900}
    defaultProps={{ id: "teachers_he", data: null as AdData | null }}
    calculateMetadata={async ({ props }) => {
      const res = await fetch(staticFile(`props/${props.id}.json`));
      const data = (await res.json()) as AdData;
      return { durationInFrames: Math.round(data.total * data.fps), props: { ...props, data } };
    }}
  />
);
