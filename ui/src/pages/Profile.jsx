import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./Profile.css";

function Profile({ setUser }) {
  const [user, setUserData] = useState(null);
  const [birthdate, setBirthdate] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const id = localStorage.getItem("user_id");
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:5000/users/${id}`);
      const data = await res.json();

      setUserData(data);
      setBirthdate(data.birthdate ? data.birthdate.split("T")[0] : "");
      setAddress(data.address || "");
      setProfileImage(data.profile_picture || "");
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // UPDATE BIRTHDATE
  // ======================
  const updateBirthdate = async () => {
    const id = localStorage.getItem("user_id");

    await fetch(`http://localhost:5000/users/${id}/birthdate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthdate }),
    });

    fetchUser();
    alert("Birthdate updated!");
  };

  // ======================
  // UPDATE ADDRESS
  // ======================
  const updateAddress = async () => {
    const id = localStorage.getItem("user_id");

    await fetch(`http://localhost:5000/users/${id}/address`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });

    fetchUser();
    alert("Address updated!");
  };

  // ======================
  // PROFILE IMAGE
  // ======================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      setProfileImage(reader.result);

      const id = localStorage.getItem("user_id");

      await fetch(`http://localhost:5000/users/${id}/profile-picture`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_picture: reader.result }),
      });

      fetchUser();
    };

    reader.readAsDataURL(file);
  };

  if (!user) return <h1 style={{ color: "white", padding: "50px" }}>Loading...</h1>;

  return (
    <>
      <Navbar setUser={setUser} />

      <div className="profile-page">
        <div className="profile-card">

          {/* PROFILE IMAGE */}
          <div className="profile-image-section">
            {profileImage ? (
              <img src={profileImage} className="profile-image" alt="profile" />
            ) : (
              <div className="profile-placeholder">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}

            <label className="upload-photo-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>

          {/* NAME & EMAIL */}
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="role-badge">{user.role}</span>

          {/* INFO FIELDS */}
          <div className="profile-info">

            <div className="info-box">
              <label>Birthdate</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
              <button onClick={updateBirthdate}>Update</button>
              <p>Current Age: {user.age || "Not set"}</p>
            </div>

            <div className="info-box">
              <label>Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
              <button onClick={updateAddress}>Update</button>
            </div>

            <div className="info-box">
              <label>Member Since</label>
              <p>{new Date(user.created_at).toLocaleString()}</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
