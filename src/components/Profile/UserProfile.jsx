import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import "../../Views/ClientDashboard/ClientDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "No se pudo obtener el perfil"
          );
        }

        setProfile(data);

        setProfileData({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          country: data.country ?? "",
          city: data.city ?? "",
          address: data.address ?? "",
        });
      } catch (error) {
        toast.error(
          error.message || "No se pudo obtener el perfil."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getProfile();
    }
  }, [token]);

  const getInitials = () => {
    if (!profileData.name) return "";

    return profileData.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadImage = async () => {
    if (!selectedImage || !profile?.id) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch(
        `${API_URL}/users/${profile.id}/upload-avatar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "No se pudo subir la imagen"
        );
      }

      setProfile(data);
      setSelectedImage(null);
      setImagePreview(null);

      toast.success(
        "Foto de perfil actualizada correctamente"
      );
    } catch (error) {
      toast.error(
        error.message || "No se pudo actualizar la foto"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      };

      if (profileData.country?.trim()) {
        payload.country = profileData.country;
      }

      if (profileData.city?.trim()) {
        payload.city = profileData.city;
      }

      if (profileData.address?.trim()) {
        payload.address = profileData.address;
      }

      const response = await fetch(
        `${API_URL}/users/${profile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(". ")
            : data.message ||
                "No se pudo actualizar el perfil"
        );
      }

      setProfile((current) => ({
        ...current,
        ...profileData,
      }));

      toast.success(
        "¡Perfil actualizado correctamente!"
      );
    } catch (error) {
      const formattedMessage = String(
        error.message || ""
      ).replace(/,/g, ". ");

      toast.error(
        formattedMessage ||
          "No se pudo actualizar el perfil."
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-state">
        Cargando perfil...
      </div>
    );
  }

  return (
    <section className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {imagePreview || profile?.imgUrl ? (
            <img
              src={imagePreview || profile.imgUrl}
              alt="Foto de perfil"
              className="profile-avatar-image"
            />
          ) : (
            getInitials()
          )}
        </div>

        <div>
          <div className="profile-photo-actions">
            <label
              htmlFor="profile-image"
              className="change-photo-button"
            >
              Cambiar foto
            </label>

            <input
              id="profile-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              hidden
            />

            {selectedImage && (
              <button
                type="button"
                className="upload-photo-button"
                onClick={handleUploadImage}
                disabled={uploadingImage}
              >
                {uploadingImage
                  ? "Subiendo..."
                  : "Guardar foto"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label>Nombre</label>

          <input
            value={profileData.name}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            value={profileData.email}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                email: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>

          <input
            value={profileData.phone}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                phone: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>País</label>

          <input
            value={profileData.country}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                country: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Ciudad</label>

          <input
            value={profileData.city}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                city: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>

          <input
            value={profileData.address}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                address: e.target.value,
              })
            }
          />
        </div>

        <button
          type="button"
          className="save-profile-button"
          onClick={handleSaveProfile}
        >
          Guardar cambios
        </button>
      </div>
    </section>
  );
};

export default UserProfile;