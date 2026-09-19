const CompleteGoogleRegistration = ({
  phone,
  setPhone,
  country,
  setCountry,
  city,
  setCity,
  address,
  setAddress,
  error,
  onSubmit,
}) => {
  return (
    <>
      <h1 className="loginTitle">Ya casi terminamos</h1>

      <p className="loginSubtitle">
        Necesitamos tu teléfono para completar tu registro.
      </p>

      <form onSubmit={onSubmit} className="loginForm">
        <div className="inputGroup">
          <label className="label" htmlFor="google-phone">
            Teléfono
          </label>

          <input
            id="google-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="+54 9 341 ..."
            required
          />
        </div>

        <div className="inputGroup">
          <label className="label" htmlFor="google-country">
            País (opcional)
          </label>

          <input
            id="google-country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input"
            placeholder="Argentina"
          />
        </div>

        <div className="inputGroup">
          <label className="label" htmlFor="google-city">
            Ciudad (opcional)
          </label>

          <input
            id="google-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
            placeholder="Rosario"
          />
        </div>

        <div className="inputGroup">
          <label className="label" htmlFor="google-address">
            Dirección (opcional)
          </label>

          <input
            id="google-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
            placeholder="Av. Pellegrini 1234"
          />
        </div>

        {error && <p className="loginError">{error}</p>}

        <button type="submit" className="submitButton">
          Completar registro
        </button>
      </form>
    </>
  );
};

export default CompleteGoogleRegistration;