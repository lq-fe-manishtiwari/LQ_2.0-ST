// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
// import { Offline } from "react-detect-offline";

import { authenticationService } from "@/_services/api";
import loginImg from "./loginImg.mp4"; 
import Logo from "@/_assets/images_new_design/Login/lq_new.png";
import "@/_assets/customStyle.css";

// Validation Schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Username is required"),
  password: Yup.string().trim().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (authenticationService.currentUserValue) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Alert Helpers
  const showSuccessAlert = () => {
    setAlert(
      <SweetAlert
        success
        title="Login Successful!"
        onConfirm={() => {
          setAlert(null);
          navigate("/dashboard");
        }}
        confirmBtnCssClass="btn-confirm"
      >
        Welcome back to LearnQoch!
      </SweetAlert>
    );
  };

  const showErrorAlert = (message) => {
    setAlert(
      <SweetAlert
        danger
        title="Login Failed!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        {message || "Invalid username or password!"}
      </SweetAlert>
    );
  };

  const showWarningAlert = (message) => {
    setAlert(
      <SweetAlert
        warning
        title="Warning!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        {message || "Please try again!"}
      </SweetAlert>
    );
  };

  const showAccessDeniedAlert = () => {
    setAlert(
      <SweetAlert
        danger
        title="Access Denied!"
        onConfirm={() => setAlert(null)}
      >
        You don't have permission to access this system!
        <br />
        <strong>Only ADMIN/SUPERADMIN allowed.</strong>
      </SweetAlert>
    );
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
      {alert}

      {/* <Offline> */}
        {/* <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <span className="text-2xl font-bold text-red-600">
              You're offline. Check your connection.
            </span>
          </div>
        </div> */}
      {/* </Offline> */}

      {/* Left Side - Video */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 rounded-l-4xl overflow-hidden">
        <video autoPlay loop muted className="w-full h-full object-cover">
          <source src={loginImg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 md:py-0 bg-primary-1000">
        <div className="w-full max-w-sm">
          {/* Logo & Greeting */}
          <div className="mb-8 text-center md:text-left">
            <img src={Logo} alt="LearnQoch" className="h-16 mx-auto md:mx-0 mb-4" />
            <p className="text-primary-100 text-3xl font-light">Hello,</p>
            <p className="text-primary-200 text-sm mt-2">
              Login to start your learning journey for the day!
            </p>
          </div>

          {/* Formik Form */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setLoading(true);
              setStatus("");

              try {
                const user = await authenticationService.login({
                  username: values.email,
                  password: values.password,
                });

                const decodedUser = authenticationService.currentUser();
                const isAuthorized =
                  (decodedUser.sub === "ADMIN" && decodedUser.iss === "ADMINISTRATOR") ||
                  (decodedUser.sub === "SUPERADMIN" && decodedUser.iss === "ADMINISTRATOR") ||
                  (decodedUser.sub === "TEACHER" && decodedUser.iss === "TEACHER");               

                if (!isAuthorized) {
                  showAccessDeniedAlert();
                  setTimeout(() => authenticationService.logout(), 2000);
                  setSubmitting(false);
                  setLoading(false);
                  return;
                }

                showSuccessAlert();
              } catch (error) {
                console.error("Login error:", error);

                if (error.status === 401) {
                  showErrorAlert("Bad credentials!");
                } else if (error.status === 400) {
                  showErrorAlert("Invalid username or password!");
                } else if (error.status >= 500) {
                  showWarningAlert("Server error! Please try again later.");
                } else {
                  showErrorAlert(error.message || "Login failed!");
                }
              } finally {
                setSubmitting(false);
                setLoading(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div className="relative">
                  <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wide">
                    Enter Your Username
                  </label>
                  <div className="relative flex items-center">
                    <Field
                      type="email"
                      name="email"
                      placeholder="username@learnqoch.com"
                      disabled={loading}
                      className={`w-full bg-white bg-opacity-15 border-2 ${
                        errors.email && touched.email
                          ? "border-red-400"
                          : "border-white border-opacity-30"
                      } text-white placeholder-primary-200 px-4 py-3 rounded-2xl focus:outline-none focus:border-white focus:border-opacity-100 focus:bg-opacity-20 transition-all backdrop-blur-sm`}
                    />
                    <Mail className="absolute right-4 w-5 h-5 text-primary-100 pointer-events-none" />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-red-300 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wide">
                    Enter Your Password
                  </label>
                  <div className="relative flex items-center">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••••"
                      disabled={loading}
                      className={`w-full bg-white bg-opacity-15 border-2 ${
                        errors.password && touched.password
                          ? "border-red-400"
                          : "border-white border-opacity-30"
                      } text-white placeholder-primary-200 px-4 py-3 rounded-2xl focus:outline-none focus:border-white focus:border-opacity-100 focus:bg-opacity-20 transition-all backdrop-blur-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-4 text-primary-100 hover:text-white transition-colors z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-300 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <a
                    href="/admin-forgot-password"
                    className="text-primary-100 hover:text-white text-sm font-medium transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-105 active:scale-95 duration-200 text-base ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-white text-primary-600 hover:bg-primary-50 hover:shadow-xl"
                  }`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;





















// // src/components/Login.jsx
// import React, { useState, useEffect } from "react";
// import { Formik, Form, Field } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { Mail, Lock, Eye, EyeOff } from "lucide-react";
// import SweetAlert from "react-bootstrap-sweetalert";
// // import { Offline } from "react-detect-offline";

// import { authenticationService } from "@/_services/api";
// import loginImg from "./loginImg.mp4";
// import Logo from "@/_assets/images_new_design/Login/lq_new.png";
// import "@/_assets/customStyle.css";

// // ✅ Initialize Authentication Context
// initializeAuth();

// // ✅ Validation Schema
// const validationSchema = Yup.object().shape({
//   email: Yup.string()
//     .trim()
//     .email("Invalid email format")
//     .required("Username is required"),
//   password: Yup.string().trim().required("Password is required"),
// });

// const Login = () => {
//   const navigate = useNavigate();
//   const [alert, setAlert] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // ✅ Auto-redirect if already logged in
//   useEffect(() => {
//     const currentUser = authenticationService.currentUser();
//     if (currentUser) navigate("/dashboard");
//   }, [navigate]);

//   // ✅ Alert Helpers
//   const showSuccessAlert = () =>
//     setAlert(
//       <SweetAlert
//         success
//         title="Login Successful!"
//         onConfirm={() => {
//           setAlert(null);
//           navigate("/dashboard");
//         }}
//         confirmBtnCssClass="btn-confirm"
//       >
//         Welcome back to LearnQoch!
//       </SweetAlert>
//     );

//   const showErrorAlert = (msg) =>
//     setAlert(
//       <SweetAlert
//         danger
//         title="Login Failed!"
//         onConfirm={() => setAlert(null)}
//         confirmBtnCssClass="btn-confirm"
//       >
//         {msg || "Invalid username or password!"}
//       </SweetAlert>
//     );

//   const showWarningAlert = (msg) =>
//     setAlert(
//       <SweetAlert
//         warning
//         title="Warning!"
//         onConfirm={() => setAlert(null)}
//         confirmBtnCssClass="btn-confirm"
//       >
//         {msg || "Please try again!"}
//       </SweetAlert>
//     );

//   const showAccessDeniedAlert = () =>
//     setAlert(
//       <SweetAlert
//         danger
//         title="Access Denied!"
//         onConfirm={() => setAlert(null)}
//       >
//         You don't have permission to access this system!
//       </SweetAlert>
//     );

//   // ✅ MAIN FORM SUBMIT
//   const handleSubmit = async (values, { setSubmitting, setStatus }) => {
//     setLoading(true);
//     setStatus("");

//     try {
//       const user = await authenticationService.login({
//         username: values.email,
//         password: values.password,
//       });

//       const decodedUser = authenticationService.currentUser();

//       // ✅ Authorization Condition
//       const isAuthorized =
//         decodedUser &&
//         (decodedUser.sub === "ADMIN" ||
//           decodedUser.sub === "SUPERADMIN" ||
//           decodedUser.sub === "TEACHER");

//       if (!isAuthorized) {
//         showAccessDeniedAlert();
//         setTimeout(() => authenticationService.logout(), 2000);
//         return;
//       }

//       showSuccessAlert();
//     } catch (error) {
//       console.error("Login error:", error);

//       if (error.status === 401) showErrorAlert("Bad credentials!");
//       else if (error.status === 400)
//         showErrorAlert("Invalid username or password!");
//       else if (error.status >= 500)
//         showWarningAlert("Server error! Please try again later.");
//       else showErrorAlert(error.message || "Login failed!");
//     } finally {
//       setSubmitting(false);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
//       {alert}

//       {/* LEFT: Video */}
//       <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 rounded-l-4xl overflow-hidden">
//         <video autoPlay loop muted className="w-full h-full object-cover">
//           <source src={loginImg} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       </div>

//       {/* RIGHT: Login Form */}
//       <div className="flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 bg-primary-1000">
//         <div className="w-full max-w-sm">
//           {/* Logo */}
//           <div className="mb-8 text-center md:text-left">
//             <img src={Logo} alt="LearnQoch" className="h-16 mx-auto md:mx-0 mb-4" />
//             <p className="text-primary-100 text-3xl font-light">Hello,</p>
//             <p className="text-primary-200 text-sm mt-2">
//               Login to start your learning journey for the day!
//             </p>
//           </div>

//           {/* Formik Form */}
//           <Formik
//             initialValues={{ email: "", password: "" }}
//             validationSchema={validationSchema}
//             onSubmit={handleSubmit}
//           >
//             {({ errors, touched, isSubmitting }) => (
//               <Form className="space-y-6">
//                 {/* Username */}
//                 <div className="relative">
//                   <label className="block text-white text-xs font-semibold mb-2 uppercase">
//                     Enter Your Username
//                   </label>
//                   <div className="relative flex items-center">
//                     <Field
//                       type="text"
//                       name="email"
//                       placeholder="Enter your username"
//                       disabled={loading}
//                       className={`w-full bg-white bg-opacity-15 border-2 ${
//                         errors.email && touched.email
//                           ? "border-red-400"
//                           : "border-white border-opacity-30"
//                       } text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-white transition-all`}
//                     />
//                     <Mail className="absolute right-4 w-5 h-5 text-primary-100 pointer-events-none" />
//                   </div>
//                   {errors.email && touched.email && (
//                     <p className="text-red-300 text-xs mt-1">{errors.email}</p>
//                   )}
//                 </div>

//                 {/* Password */}
//                 <div className="relative">
//                   <label className="block text-white text-xs font-semibold mb-2 uppercase">
//                     Enter Your Password
//                   </label>
//                   <div className="relative flex items-center">
//                     <Field
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       placeholder="••••••••••"
//                       disabled={loading}
//                       className={`w-full bg-white bg-opacity-15 border-2 ${
//                         errors.password && touched.password
//                           ? "border-red-400"
//                           : "border-white border-opacity-30"
//                       } text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-white transition-all`}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-4 text-primary-100 hover:text-white"
//                     >
//                       {showPassword ? (
//                         <EyeOff className="w-5 h-5" />
//                       ) : (
//                         <Eye className="w-5 h-5" />
//                       )}
//                     </button>
//                   </div>
//                   {errors.password && touched.password && (
//                     <p className="text-red-300 text-xs mt-1">
//                       {errors.password}
//                     </p>
//                   )}
//                 </div>

//                 {/* Forgot Password */}
//                 <div className="text-right">
//                   <a
//                     href="/admin-forgot-password"
//                     className="text-primary-100 hover:text-white text-sm font-medium"
//                   >
//                     Forgot Password?
//                   </a>
//                 </div>

//                 {/* Submit */}
//                 <button
//                   type="submit"
//                   disabled={isSubmitting || loading}
//                   className={`w-full font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 duration-200 ${
//                     loading
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-white text-primary-600 hover:bg-primary-50"
//                   }`}
//                 >
//                   {loading ? "Logging in..." : "Login"}
//                 </button>
//               </Form>
//             )}
//           </Formik>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
