export async function explainVerse(query: string) {
  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      } else {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}...`);
      }
    }

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}: ${text.slice(0, 100)}...`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
