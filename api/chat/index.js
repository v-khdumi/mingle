module.exports = async function (context, req) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;

  if (!endpoint || !apiKey) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Azure OpenAI is not configured." },
    };
    return;
  }

  const { prompt, model, jsonMode } = req.body || {};

  if (!prompt) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "prompt is required." },
    };
    return;
  }

  const deploymentName = model || "gpt-4o-mini";
  const apiVersion = "2024-08-01-preview";
  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(deploymentName)}/chat/completions?api-version=${apiVersion}`;

  const messages = [{ role: "user", content: prompt }];
  const body = {
    messages,
    temperature: 0.7,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      context.res = {
        status: response.status,
        headers: { "Content-Type": "application/json" },
        body: { error: `Azure OpenAI error: ${errorText}` },
      };
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { content },
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: err.message || "Internal server error" },
    };
  }
};
