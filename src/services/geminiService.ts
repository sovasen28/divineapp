export async function explainVerse(query: string) {
  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch explanation.");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
