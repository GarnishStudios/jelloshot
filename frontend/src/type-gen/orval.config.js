module.exports = {
  api: {
    input: "openapi.json",
    output: {
      target: "api.ts",
      client: "axios",
      hooks: true,
      baseUrl: "http://localhost:8000",
    },
  },
};
