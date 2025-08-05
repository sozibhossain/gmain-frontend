
export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    return {
      success: true,
      data: data,

    };
  } catch (error) {
    // console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login",
      error,
    };
  }
}



