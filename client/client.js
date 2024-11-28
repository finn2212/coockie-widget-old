const client = class Client {
  constructor(api_base, uuid) {
    this.api_base = api_base;
    this.uuid = uuid;
  }

  async storeLog(data) {
    const response = await fetch(`${this.api_base}/${this.uuid}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }
};

export default client;
