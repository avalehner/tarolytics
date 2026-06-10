import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";
import { getCityData } from "../services/cityService";
import AsyncSelect from "react-select/async";
import DatePicker from "../components/DatePicker";
import type { CityTypes, CityOptionTypes, UserTypes } from "../types";
import { saveProfileData } from "../services/userService";
import styles from "./css/ProfilePage.module.css";

interface ProflePageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const ProfilePage = ({ currentUser, isAuthLoading }: ProflePageProps) => {
  const navigate = useNavigate();

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<string>("");
  const [birthTimeZone, setBirthTimeZone] = useState<ITimezone>( //required type by <TimezoneSelect> component
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [birthLocationObj, setBirthLocationObj] = useState<CityTypes | null>(
    null,
  );
  const [birthCity, setBirthCity] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.birthday) {
      setBirthDate(new Date(currentUser.birthday));
    }

    setBirthTime(currentUser.birth_time ?? "");
    setBirthTimeZone(
      currentUser.birth_timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    setBirthCity(currentUser.birth_city ?? null);
  }, [currentUser]); //reruns everytime currentUser changes

  const loadCityOptions = async (city: string) => {
    if (city.length < 3) return [];
    const cityData = await getCityData(city);
    return cityData.map((city) => ({
      label: city.formatted, //text displayed in dropdown
      value: city, //value to pass to onChange when an option is selected
    }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      setIsSaving(true);
      setSaveMessage("saving...");
      const profileObj = {
        birthday: birthDate ? birthDate.toLocaleDateString("en-CA") : null,
        birth_time: birthTime,
        birth_timezone:
          typeof birthTimeZone === "string"
            ? birthTimeZone
            : birthTimeZone.value,
        birth_location: birthLocationObj,
      };

      const updatedProfile = await saveProfileData(currentUser?.id, profileObj);
      console.log(updatedProfile);
      setSaveMessage("profile saved :)");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error ";
      console.error(message);
      setSaveMessage(`error: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles["profile-container"]}>
      <h1>Your Profile</h1>
      <p>name: {currentUser?.full_name}</p>
      <p>email: {currentUser?.email}</p>
      <div className={styles["birthday-container"]}>
        <p>birthday:</p>
        <DatePicker date={birthDate} setDate={setBirthDate} />
      </div>
      <div className={styles["birthtime-container"]}>
        <label>birth time:</label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
        />
      </div>
      <div className={styles["birth-timezone-container"]}>
        <label>timezone:</label>
        <TimezoneSelect value={birthTimeZone} onChange={setBirthTimeZone} />
      </div>
      <div className={styles["birth-location-container"]}>
        <p>birth location:</p>
        <AsyncSelect<CityOptionTypes>
          value={
            birthCity
              ? {
                  label: birthCity,
                  value: birthLocationObj ?? {
                    formatted: birthCity,
                    lat: 0, //placeholder
                    lng: 0, //placeholder
                  },
                }
              : null
          }
          loadOptions={loadCityOptions}
          placeholder="search city..."
          onChange={(selected) => {
            if (selected) {
              setBirthLocationObj(selected.value);
              setBirthCity(selected.value.formatted);
            }
          }}
        />
      </div>
      <button
        className="save-profile-btn"
        onClick={async () => {
          console.log("button clicked");
          await handleSaveProfile();
        }}
      >
        UPDATE PROFILE
      </button>

      {/* <button>UPDATE PROFILE</button>
      )} */}
      {saveMessage}
    </div>
  );
};

export default ProfilePage;
