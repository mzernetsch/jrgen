  {{NAME}} (params{{PARAMS_TYPE}}) {
    return new Promise<{{RESULT_TYPE}}>((resolve, reject) => {
      this.request('{{METHOD}}', params).then(resolve).catch(reject);
    });
  }
