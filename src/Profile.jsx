import {
  useEffect,
  useState,
} from "react";

import "./Profile.css";

import {
  clearAuth,
  createAddress,
  deleteAddress,
  getAddresses,
  getMyProfile,
  getToken,
  loginUser,
  registerUser,
  setDefaultAddress,
  updateAddress,
  updateMyProfile,
} from "./api";

function Profile({
  setActivePage,
  authenticated = false,
  customer = null,
  addresses = [],
  setAddresses,
  wishlist = [],
  toggleWishlist,
  addToCart,
  onAuthChanged,
}) {

  // =======================================================
  // MODAL
  // =======================================================

  const [
    activeModal,
    setActiveModal,
  ] = useState(null);

  // =======================================================
  // LOGIN
  // =======================================================

  const [
    loginData,
    setLoginData,
  ] = useState({
    mobile: "",
    password: "",
  });

  // =======================================================
  // REGISTER
  // =======================================================

  const [
    registerData,
    setRegisterData,
  ] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    city: "Ahilya Nagar",
    pincode: "",
    password: "",
  });

  // =======================================================
  // PROFILE
  // =======================================================

  const [
    profile,
    setProfile,
  ] = useState(customer);

  const [
    profileForm,
    setProfileForm,
  ] = useState({
    name: "",
    email: "",
    profilePhoto: "",
    dateOfBirth: "",
    gender: "",
  });

  // =======================================================
  // ADDRESS
  // =======================================================

  const [
    newAddress,
    setNewAddress,
  ] = useState({
    addressType: "Home",
    fullName: "",
    mobile: "",
    houseNo: "",
    area: "",
    landmark: "",
    city: "Ahilya Nagar",
    state: "Maharashtra",
    pincode: "",
    latitude: null,
    longitude: null,
    isDefault: false,
  });

  const [
    editingAddressId,
    setEditingAddressId,
  ] = useState(null);

  // =======================================================
  // PAYMENT METHODS
  // Local only - backend payment-method CRUD नाही.
  // =======================================================

  const [
    payments,
    setPayments,
  ] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "maxigo_payment_methods"
        );

      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              type: "Cash on Delivery",
              detail:
                "Pay when your order arrives",
              icon: "💵",
            },
          ];

    } catch {

      return [];
    }
  });

  useEffect(() => {

    localStorage.setItem(
      "maxigo_payment_methods",
      JSON.stringify(
        payments
      )
    );

  }, [payments]);

  // =======================================================
  // LOAD PROFILE
  // =======================================================

  useEffect(() => {

    if (!authenticated) {
      return;
    }

    loadProfile();

  }, [
    authenticated,
  ]);

  const loadProfile =
    async () => {

      try {

        const data =
          await getMyProfile();

        setProfile(
          data
        );

        setProfileForm({
          name:
            data?.name ||
            "",
          email:
            data?.email ||
            "",
          profilePhoto:
            data?.profilePhoto ||
            "",
          dateOfBirth:
            data?.dateOfBirth ||
            "",
          gender:
            data?.gender ||
            "",
        });

      } catch (
        error
      ) {

        console.error(
          error
        );
      }
    };

  // =======================================================
  // LOAD ADDRESSES
  // =======================================================

  const refreshAddresses =
    async () => {

      try {

        const data =
          await getAddresses();

        setAddresses?.(
          Array.isArray(
            data
          )
            ? data
            : []
        );

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Unable to load addresses."
        );
      }
    };

  // =======================================================
  // LOGIN CHANGE
  // =======================================================

  const handleLoginChange =
    (e) => {

      setLoginData(
        (current) => ({
          ...current,
          [e.target.name]:
            e.target.value,
        })
      );
    };

  // =======================================================
  // LOGIN
  // =======================================================

  const handleLogin =
    async (e) => {

      e.preventDefault();

      if (
        !loginData.mobile ||
        !loginData.password
      ) {

        alert(
          "Please enter mobile number and password."
        );

        return;
      }

      try {

        const response =
          await loginUser(
            loginData.mobile,
            loginData.password
          );

        setProfile(
          response
        );

        setActiveModal(
          null
        );

        setLoginData({
          mobile: "",
          password: "",
        });

        await onAuthChanged?.(
          response
        );

        alert(
          "Login successful!"
        );

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Login failed."
        );
      }
    };

  // =======================================================
  // REGISTER CHANGE
  // =======================================================

  const handleRegisterChange =
    (e) => {

      setRegisterData(
        (current) => ({
          ...current,
          [e.target.name]:
            e.target.value,
        })
      );
    };
  // =======================================================
  // REGISTER
  // =======================================================

  const handleRegister =
    async (e) => {

      e.preventDefault();

      if (
        !registerData.fullName
      ) {

        alert(
          "Please enter your full name."
        );

        return;
      }

      if (
        !registerData.mobile ||
        registerData.mobile.length !==
          10
      ) {

        alert(
          "Please enter valid 10 digit mobile number."
        );

        return;
      }

      if (
        !registerData.password
      ) {

        alert(
          "Please create password / PIN."
        );

        return;
      }

      if (
        !registerData.address
      ) {

        alert(
          "Please enter your address."
        );

        return;
      }

      if (
        !registerData.pincode
      ) {

        alert(
          "Please enter pincode."
        );

        return;
      }

      try {

        // -------------------------------------------------
        // CREATE USER
        // -------------------------------------------------

        const authResponse =
          await registerUser({

            name:
              registerData.fullName.trim(),

            mobile:
              registerData.mobile.trim(),

            email:
              registerData.email.trim() ||
              null,

            password:
              registerData.password,

          });

        // -------------------------------------------------
        // CREATE FIRST ADDRESS
        // -------------------------------------------------

        await createAddress({

          addressType:
            "Home",

          fullName:
            registerData.fullName.trim(),

          mobile:
            registerData.mobile.trim(),

          houseNo:
            "",

          area:
            registerData.address.trim(),

          landmark:
            "",

          city:
            registerData.city.trim(),

          state:
            "Maharashtra",

          pincode:
            registerData.pincode.trim(),

          latitude:
            null,

          longitude:
            null,

          isDefault:
            true,
        });

        setProfile(
          authResponse
        );

        setRegisterData({
          fullName: "",
          mobile: "",
          email: "",
          address: "",
          city:
            "Ahilya Nagar",
          pincode: "",
          password: "",
        });

        setOtpSent(
          false
        );

        setActiveModal(
          null
        );

        await refreshAddresses();

        await onAuthChanged?.(
          authResponse
        );

        alert(
          "MaxiGo account created successfully!"
        );

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Registration failed."
        );
      }
    };

  // =======================================================
  // PROFILE FORM
  // =======================================================

  const handleProfileChange =
    (e) => {

      setProfileForm(
        (current) => ({
          ...current,
          [e.target.name]:
            e.target.value,
        })
      );
    };

  const handleUpdateProfile =
    async (e) => {

      e.preventDefault();

      try {

        const payload = {
          name:
            profileForm.name.trim(),
          email:
            profileForm.email.trim(),
          profilePhoto:
            profileForm.profilePhoto.trim(),
          gender:
            profileForm.gender.trim(),
        };

        if (
          profileForm.dateOfBirth
        ) {

          payload.dateOfBirth =
            profileForm.dateOfBirth;
        }

        const response =
          await updateMyProfile(
            payload
          );

        setProfile(
          response
        );

        setActiveModal(
          null
        );

        await onAuthChanged?.(
          response
        );

        alert(
          "Profile updated successfully."
        );

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Unable to update profile."
        );
      }
    };

  // =======================================================
  // ADDRESS CHANGE
  // =======================================================

  const handleAddressChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;

      setNewAddress(
        (current) => ({
          ...current,
          [name]:
            value,
        })
      );
    };

  // =======================================================
  // SAVE ADDRESS
  // =======================================================

  const saveAddress =
    async (e) => {

      e.preventDefault();

      if (
        !newAddress.fullName ||
        !newAddress.mobile ||
        !newAddress.area ||
        !newAddress.city ||
        !newAddress.pincode
      ) {

        alert(
          "Please fill required address fields."
        );

        return;
      }

      try {

        if (
          editingAddressId
        ) {

          await updateAddress(
            editingAddressId,
            newAddress
          );

          alert(
            "Address updated successfully."
          );

        } else {

          await createAddress(
            newAddress
          );

          alert(
            "Address added successfully."
          );
        }

        setEditingAddressId(
          null
        );

        setNewAddress({
          addressType:
            "Home",
          fullName:
            profile?.name ||
            "",
          mobile:
            profile?.mobile ||
            "",
          houseNo: "",
          area: "",
          landmark: "",
          city:
            "Ahilya Nagar",
          state:
            "Maharashtra",
          pincode: "",
          latitude:
            null,
          longitude:
            null,
          isDefault:
            false,
        });

        await refreshAddresses();

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Unable to save address."
        );
      }
    };

  // =======================================================
  // EDIT ADDRESS
  // =======================================================

  const startEditAddress =
    (address) => {

      setEditingAddressId(
        address.id
      );

      setNewAddress({
        addressType:
          address.addressType ||
          "Home",
        fullName:
          address.fullName ||
          "",
        mobile:
          address.mobile ||
          "",
        houseNo:
          address.houseNo ||
          "",
        area:
          address.area ||
          "",
        landmark:
          address.landmark ||
          "",
        city:
          address.city ||
          "",
        state:
          address.state ||
          "",
        pincode:
          address.pincode ||
          "",
        latitude:
          address.latitude ??
          null,
        longitude:
          address.longitude ??
          null,
        isDefault:
          Boolean(
            address.isDefault
          ),
      });
    };

  // =======================================================
  // DELETE ADDRESS
  // =======================================================

  const handleDeleteAddress =
    async (id) => {

      try {

        await deleteAddress(
          id
        );

        setAddresses?.(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id
            )
        );

        alert(
          "Address deleted successfully."
        );

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Unable to delete address."
        );
      }
    };

  // =======================================================
  // DEFAULT ADDRESS
  // =======================================================

  const handleDefaultAddress =
    async (id) => {

      try {

        await setDefaultAddress(
          id
        );

        await refreshAddresses();

        alert(
          "Default address updated."
        );

      } catch (
        error
      ) {

        alert(
          error.message ||
          "Unable to set default address."
        );
      }
    };

  // =======================================================
  // PAYMENT METHODS
  // =======================================================

  const addPayment =
    (
      type,
      detail,
      icon
    ) => {

      const payment = {
        id:
          Date.now(),
        type,
        detail,
        icon,
      };

      setPayments(
        (current) => [
          ...current,
          payment,
        ]
      );
    };

  const deletePayment =
    (id) => {

      setPayments(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );
    };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout =
    () => {

      clearAuth();

      onAuthChanged?.(
        null
      );

      setActiveModal(
        null
      );

      alert(
        "Logged out successfully."
      );
    };

  // =======================================================
  // ADDRESS FORMAT
  // =======================================================

  const formatAddress =
    (item) => {

      const parts = [
        item.houseNo,
        item.area,
        item.landmark,
        item.city,
        item.state,
        item.pincode,
      ].filter(Boolean);

      return parts.join(
        ", "
      );
    };

  // =======================================================
  // NOT AUTHENTICATED
  // =======================================================

  if (!authenticated) {

    return (

      <div className="profile-page">

        <div className="profile-wrapper">

          <div className="profile-welcome">

            <div className="profile-avatar">
              👤
            </div>

            <h2>
              WELCOME TO MAXIGO
            </h2>

            <p>
              Login or register to manage your account.
            </p>

            <div className="auth-buttons">

              <button
                type="button"
                className="login-button"
                onClick={() =>
                  setActiveModal(
                    "login"
                  )
                }
              >
                Login
              </button>

              <button
                type="button"
                className="register-button"
                onClick={() =>
                  setActiveModal(
                    "register"
                  )
                }
              >
                Register
              </button>

            </div>

          </div>

          <div className="profile-options">

            <button
              type="button"
              className="profile-option"
              onClick={() =>
                setActiveModal(
                  "login"
                )
              }
            >

              <span className="profile-option-icon">
                📍
              </span>

              <span className="profile-option-title">
                My Addresses
              </span>

              <span className="profile-arrow">
                →
              </span>

            </button>

            <button
              type="button"
              className="profile-option"
              onClick={() =>
                setActiveModal(
                  "login"
                )
              }
            >

              <span className="profile-option-icon">
                💳
              </span>

              <span className="profile-option-title">
                Payment Methods
              </span>

              <span className="profile-arrow">
                →
              </span>

            </button>

            <button
              type="button"
              className="profile-option"
              onClick={() =>
                setActiveModal(
                  "login"
                )
              }
            >

              <span className="profile-option-icon">
                ❤️
              </span>

              <span className="profile-option-title">
                My Wishlist
              </span>

              <span className="profile-arrow">
                →
              </span>

            </button>

          </div>

        </div>

        {/* LOGIN */}

        {activeModal ===
          "login" && (

          <div className="profile-overlay">

            <div className="profile-modal">

              <button
                type="button"
                className="profile-modal-close"
                onClick={() =>
                  setActiveModal(
                    null
                  )
                }
              >
                ✕
              </button>

              <h2>
                Login
              </h2>

              <p className="profile-modal-subtitle">
                Login to your MaxiGo account
              </p>

              <form
                className="profile-form"
                onSubmit={
                  handleLogin
                }
              >

                <div className="profile-form-group">

                  <label>
                    Mobile Number
                  </label>

                  <div className="mobile-input">

                    <span className="mobile-code">
                      +91
                    </span>

                    <input
                      type="tel"
                      name="mobile"
                      maxLength="10"
                      value={
                        loginData.mobile
                      }
                      onChange={
                        handleLoginChange
                      }
                      placeholder="Enter 10 digit mobile number"
                    />

                  </div>

                </div>

                <div className="profile-form-group">

                  <label>
                    Password / PIN
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      loginData.password
                    }
                    onChange={
                      handleLoginChange
                    }
                    placeholder="Enter password or PIN"
                  />

                </div>

                <button
                  type="submit"
                  className="submit-profile"
                >
                  Login
                </button>

              </form>

            </div>

          </div>
        )}

        {/* REGISTER */}

        {activeModal ===
          "register" && (

          <div className="profile-overlay">

            <div className="profile-modal">

              <button
                type="button"
                className="profile-modal-close"
                onClick={() =>
                  setActiveModal(
                    null
                  )
                }
              >
                ✕
              </button>

              <h2>
                Create Account
              </h2>

              <p className="profile-modal-subtitle">
                Register your MaxiGo account
              </p>

              <form
                className="profile-form"
                onSubmit={
                  handleRegister
                }
              >

                <div className="profile-form-group">

                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      registerData.fullName
                    }
                    onChange={
                      handleRegisterChange
                    }
                    placeholder="Enter your full name"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Mobile Number *
                  </label>

                  <div className="mobile-input">

                    <span className="mobile-code">
                      +91
                    </span>

                    <input
                      type="tel"
                      name="mobile"
                      maxLength="10"
                      value={
                        registerData.mobile
                      }
                      onChange={
                        handleRegisterChange
                      }
                      placeholder="Enter 10 digit mobile number"
                    />

                  </div>

                </div>

                <div className="profile-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      registerData.email
                    }
                    onChange={
                      handleRegisterChange
                    }
                    placeholder="Enter your email"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Delivery Address *
                  </label>

                  <textarea
                    name="address"
                    value={
                      registerData.address
                    }
                    onChange={
                      handleRegisterChange
                    }
                    placeholder="House No, Street, Area"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      registerData.city
                    }
                    onChange={
                      handleRegisterChange
                    }
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Pincode *
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    maxLength="6"
                    value={
                      registerData.pincode
                    }
                    onChange={
                      handleRegisterChange
                    }
                    placeholder="Enter pincode"
                  />

                </div>

                <div className="profile-form-group">

                  <label>
                    Password / PIN *
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      registerData.password
                    }
                    onChange={
                      handleRegisterChange
                    }
                    placeholder="Create password or PIN"
                  />

                </div>

                <button
                  type="submit"
                  className="submit-profile"
                >
                  Create Account
                </button>

              </form>

            </div>

          </div>
        )}

      </div>
    );
  }

  // =======================================================
  // LOGGED-IN PROFILE
  // =======================================================

  return (

    <div className="profile-page">

      <div className="profile-wrapper">

        {/* ================================================= */}
        {/* WELCOME */}
        {/* ================================================= */}

        <div className="profile-welcome">

          <div className="profile-avatar">
            👤
          </div>

          <h2>
            {
              profile?.name ||
              customer?.name ||
              "MAXIGO CUSTOMER"
            }
          </h2>

          <p>
            {
              profile?.mobile ||
              customer?.mobile ||
              ""
            }
          </p>

          {profile?.email && (

            <p>
              {
                profile.email
              }
            </p>

          )}

          <div className="auth-buttons">

            <button
              type="button"
              className="login-button"
              onClick={() => {

                setProfileForm({
                  name:
                    profile?.name ||
                    "",
                  email:
                    profile?.email ||
                    "",
                  profilePhoto:
                    profile?.profilePhoto ||
                    "",
                  dateOfBirth:
                    profile?.dateOfBirth ||
                    "",
                  gender:
                    profile?.gender ||
                    "",
                });

                setActiveModal(
                  "edit-profile"
                );
              }}
            >
              Edit Profile
            </button>

            <button
              type="button"
              className="register-button"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* OPTIONS */}
        {/* ================================================= */}

        <div className="profile-options">

          <button
            type="button"
            className="profile-option"
            onClick={() =>
              setActiveModal(
                "address"
              )
            }
          >

            <span className="profile-option-icon">
              📍
            </span>

            <span className="profile-option-title">
              My Addresses
            </span>

            <span className="profile-arrow">
              →
            </span>

          </button>

          <button
            type="button"
            className="profile-option"
            onClick={() =>
              setActiveModal(
                "payment"
              )
            }
          >

            <span className="profile-option-icon">
              💳
            </span>

            <span className="profile-option-title">
              Payment Methods
            </span>

            <span className="profile-arrow">
              →
            </span>

          </button>

          <button
            type="button"
            className="profile-option"
            onClick={() =>
              setActiveModal(
                "wishlist"
              )
            }
          >

            <span className="profile-option-icon">
              ❤️
            </span>

            <span className="profile-option-title">
              My Wishlist
            </span>

            <span className="profile-arrow">
              →
            </span>

          </button>

          <button
            type="button"
            className="profile-option"
            onClick={() =>
              setActivePage("referral")
            }
          >

            <span className="profile-option-icon">
              🎁
            </span>

            <span className="profile-option-title">
              Refer & Earn
            </span>

            <span className="profile-arrow">
              →
            </span>

          </button>

          <button
            type="button"
            className="profile-option"
            onClick={() =>
              setActivePage("wallet")
            }
          >

            <span className="profile-option-icon">
              💰
            </span>

            <span className="profile-option-title">
              MaxiGo Wallet
            </span>

            <span className="profile-arrow">
              →
            </span>

          </button>

          <button
            type="button"
            className="profile-option"
            onClick={() =>
              setActiveModal(
                "settings"
              )
            }
          >

            <span className="profile-option-icon">
              ⚙️
            </span>

            <span className="profile-option-title">
              Settings
            </span>

            <span className="profile-arrow">
              →
            </span>

          </button>

        </div>

      </div>

      {/* =================================================== */}
      {/* EDIT PROFILE */}
      {/* =================================================== */}

      {activeModal ===
        "edit-profile" && (

        <div className="profile-overlay">

          <div className="profile-modal">

            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setActiveModal(
                  null
                )
              }
            >
              ✕
            </button>

            <h2>
              Edit Profile
            </h2>

            <p className="profile-modal-subtitle">
              Update your MaxiGo profile
            </p>

            <form
              className="profile-form"
              onSubmit={
                handleUpdateProfile
              }
            >

              <div className="profile-form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    profileForm.name
                  }
                  onChange={
                    handleProfileChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    profileForm.email
                  }
                  onChange={
                    handleProfileChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Profile Photo URL
                </label>

                <input
                  type="text"
                  name="profilePhoto"
                  value={
                    profileForm.profilePhoto
                  }
                  onChange={
                    handleProfileChange
                  }
                  placeholder="https://..."
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={
                    profileForm.dateOfBirth
                  }
                  onChange={
                    handleProfileChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Gender
                </label>

                <select
                  name="gender"
                  value={
                    profileForm.gender
                  }
                  onChange={
                    handleProfileChange
                  }
                >

                  <option value="">
                    Select Gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </div>

              <button
                type="submit"
                className="submit-profile"
              >
                Save Changes
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =================================================== */}
      {/* ADDRESS */}
      {/* =================================================== */}

      {activeModal ===
        "address" && (

        <div className="profile-overlay">

          <div className="profile-modal">

            <button
              type="button"
              className="profile-modal-close"
              onClick={() => {

                setActiveModal(
                  null
                );

                setEditingAddressId(
                  null
                );

              }}
            >
              ✕
            </button>

            <h2>
              My Addresses
            </h2>

            <p className="profile-modal-subtitle">
              Manage your delivery addresses
            </p>

            <div className="address-list">

              {addresses.length ===
              0 ? (

                <p>
                  No addresses found.
                </p>

              ) : (

                addresses.map(
                  (item) => (

                    <div
                      className="payment-method"
                      key={
                        item.id
                      }
                    >

                      <span className="payment-method-icon">
                        📍
                      </span>

                      <div className="payment-method-info">

                        <strong>
                          {
                            item.addressType ||
                            "Address"
                          }

                          {(
                            item.isDefault ===
                              true ||
                            item.isDefault ===
                              "true"
                          ) && (
                            <span
                              style={{
                                marginLeft:
                                  "8px",
                              }}
                            >
                              DEFAULT
                            </span>
                          )}

                        </strong>

                        <span>
                          {
                            item.fullName
                          }

                          <br />

                          {
                            item.mobile
                          }

                          <br />

                          {
                            formatAddress(
                              item
                            )
                          }

                        </span>

                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "6px",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            startEditAddress(
                              item
                            )
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDefaultAddress(
                              item.id
                            )
                          }
                        >
                          ⭐
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteAddress(
                              item.id
                            )
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </div>

                  )
                )
              )}

            </div>

            <form
              className="profile-form"
              onSubmit={
                saveAddress
              }
              style={{
                marginTop:
                  "20px",
              }}
            >

              <h3>
                {
                  editingAddressId
                    ? "Edit Address"
                    : "Add Address"
                }
              </h3>

              <div className="profile-form-group">

                <label>
                  Address Type
                </label>

                <select
                  name="addressType"
                  value={
                    newAddress.addressType
                  }
                  onChange={
                    handleAddressChange
                  }
                >

                  <option value="Home">
                    Home
                  </option>

                  <option value="Work">
                    Work
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              <div className="profile-form-group">

                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={
                    newAddress.fullName
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Mobile *
                </label>

                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  value={
                    newAddress.mobile
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  House No
                </label>

                <input
                  type="text"
                  name="houseNo"
                  value={
                    newAddress.houseNo
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Area *
                </label>

                <textarea
                  name="area"
                  value={
                    newAddress.area
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter area / street"
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Landmark
                </label>

                <input
                  type="text"
                  name="landmark"
                  value={
                    newAddress.landmark
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  City *
                </label>

                <input
                  type="text"
                  name="city"
                  value={
                    newAddress.city
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={
                    newAddress.state
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <div className="profile-form-group">

                <label>
                  Pincode *
                </label>

                <input
                  type="text"
                  name="pincode"
                  maxLength="6"
                  value={
                    newAddress.pincode
                  }
                  onChange={
                    handleAddressChange
                  }
                />

              </div>

              <button
                type="submit"
                className="submit-profile"
              >
                {
                  editingAddressId
                    ? "Update Address"
                    : "+ Add Address"
                }
              </button>

              {editingAddressId && (

                <button
                  type="button"
                  style={{
                    marginTop:
                      "8px",
                    width:
                      "100%",
                    padding:
                      "12px",
                  }}
                  onClick={() => {

                    setEditingAddressId(
                      null
                    );

                    setNewAddress({
                      addressType:
                        "Home",
                      fullName:
                        profile?.name ||
                        "",
                      mobile:
                        profile?.mobile ||
                        "",
                      houseNo: "",
                      area: "",
                      landmark: "",
                      city:
                        "Ahilya Nagar",
                      state:
                        "Maharashtra",
                      pincode: "",
                      latitude:
                        null,
                      longitude:
                        null,
                      isDefault:
                        false,
                    });

                  }}
                >
                  Cancel Edit
                </button>

              )}

            </form>

          </div>

        </div>
      )}

      {/* =================================================== */}
      {/* PAYMENT */}
      {/* =================================================== */}

      {activeModal ===
        "payment" && (

        <div className="profile-overlay">

          <div className="profile-modal">

            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setActiveModal(
                  null
                )
              }
            >
              ✕
            </button>

            <h2>
              Payment Methods
            </h2>

            <p className="profile-modal-subtitle">
              Saved payment methods
            </p>

            <div className="payment-list">

              {payments.map(
                (payment) => (

                  <div
                    className="payment-method"
                    key={
                      payment.id
                    }
                  >

                    <span className="payment-method-icon">
                      {
                        payment.icon
                      }
                    </span>

                    <div className="payment-method-info">

                      <strong>
                        {
                          payment.type
                        }
                      </strong>

                      <span>
                        {
                          payment.detail
                        }
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deletePayment(
                          payment.id
                        )
                      }
                    >
                      🗑️
                    </button>

                  </div>

                )
              )}

            </div>

            <div
              style={{
                display:
                  "grid",
                gap:
                  "10px",
                marginTop:
                  "20px",
              }}
            >

              <button
                type="button"
                className="payment-option"
                onClick={() =>
                  addPayment(
                    "UPI",
                    "Google Pay / PhonePe / Paytm",
                    "📱"
                  )
                }
              >

                <span>
                  📱
                </span>

                <div>

                  <strong>
                    UPI
                  </strong>

                  <small>
                    Google Pay / PhonePe / Paytm
                  </small>

                </div>

                <span>
                  +
                </span>

              </button>

              <button
                type="button"
                className="payment-option"
                onClick={() =>
                  addPayment(
                    "Debit / Credit Card",
                    "Saved card",
                    "💳"
                  )
                }
              >

                <span>
                  💳
                </span>

                <div>

                  <strong>
                    Debit / Credit Card
                  </strong>

                  <small>
                    Visa / Mastercard / RuPay
                  </small>

                </div>

                <span>
                  +
                </span>

              </button>

              <button
                type="button"
                className="payment-option"
                onClick={() =>
                  addPayment(
                    "Cash on Delivery",
                    "Pay when your order arrives",
                    "💵"
                  )
                }
              >

                <span>
                  💵
                </span>

                <div>

                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your order arrives
                  </small>

                </div>

                <span>
                  +
                </span>

              </button>

            </div>

            <p
              style={{
                marginTop:
                  "15px",
                fontSize:
                  "12px",
                opacity:
                  "0.65",
              }}
            >
              Saved payment methods are currently stored locally.
              Actual online payment gateway integration is separate.
            </p>

          </div>

        </div>
      )}

      {/* =================================================== */}
      {/* WISHLIST */}
      {/* =================================================== */}

      {activeModal ===
        "wishlist" && (

        <div className="profile-overlay">

          <div className="profile-modal wishlist-modal">

            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setActiveModal(
                  null
                )
              }
            >
              ✕
            </button>

            <h2>
              My Wishlist
            </h2>

            <p className="profile-modal-subtitle">
              Your favourite products
            </p>

            {wishlist.length ===
            0 ? (

              <div className="wishlist-empty">

                <div className="wishlist-empty-icon">
                  ❤️
                </div>

                <h3>
                  Your wishlist is empty
                </h3>

                <p>
                  Add products you love to your wishlist.
                </p>

              </div>

            ) : (

              <div className="wishlist-grid">

                {wishlist.map(
                  (item) => (

                    <div
                      className="wishlist-card"
                      key={
                        item.id
                      }
                    >

                      <button
                        type="button"
                        className="wishlist-heart"
                        onClick={() =>
                          toggleWishlist(
                            item
                          )
                        }
                      >
                        ♥
                      </button>

                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                      />

                      <div className="wishlist-info">

                        <h3>
                          {
                            item.name
                          }
                        </h3>

                        <p>
                          {
                            item.quantity
                          }
                        </p>

                        <div className="wishlist-bottom">

                          <strong>
                            ₹
                            {
                              item.price
                            }
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                item
                              )
                            }
                          >
                            ADD
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* =================================================== */}
      {/* SETTINGS */}
      {/* =================================================== */}

      {activeModal ===
        "settings" && (

        <div className="profile-overlay">

          <div className="profile-modal">

            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setActiveModal(
                  null
                )
              }
            >
              ✕
            </button>

            <h2>
              Settings
            </h2>

            <p className="profile-modal-subtitle">
              Manage your MaxiGo settings
            </p>

            <div className="profile-options">

              <button
                type="button"
                className="profile-option"
              >

                <span className="profile-option-icon">
                  🔔
                </span>

                <span className="profile-option-title">
                  Notifications
                </span>

                <span>
                  ON
                </span>

              </button>

              <button
                type="button"
                className="profile-option"
                onClick={
                  handleLogout
                }
              >

                <span className="profile-option-icon">
                  🚪
                </span>

                <span className="profile-option-title">
                  Logout
                </span>

                <span>
                  →
                </span>

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;