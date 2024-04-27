import Home from "./Home";
import { Fragment, useState } from "endr";
import ThunderDome from "./ThunderDome";

// tablet size 262 x 159 x 7.7 mm
// Screen Resolution	800 x 1280 pixels

export default () => {
  const [profilesSelected, setProfilesSelected] = useState(false);

  return (
    <Fragment>
      {profilesSelected && <ThunderDome />}
      <Home setProfilesSelected={setProfilesSelected} />;
    </Fragment>
  );
};
