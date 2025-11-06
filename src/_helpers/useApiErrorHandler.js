// src/_helpers/useApiErrorHandler.js
export const useApiErrorHandler = () => {
    return (error) => {
      console.log("error message", error);
  
      if (error?.message?.includes("Failed to fetch")) {
        console.log("server down error");
        return "Server is down or unreachable. Please try again later.";
      }
  
      if (error?.graphQLErrors?.length > 0) {
        return error.graphQLErrors[0].message || "Server returned an error.";
      }
  
      if (error?.message?.includes("NetworkError") || error?.message?.includes("network")) {
        console.log("network error");
        return "Network issue. Please check your internet.";
      }
  
      return "Something went wrong. Please try again.";
    };
  };