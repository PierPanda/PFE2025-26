export const exampleJob = {
  name: 'example',
  cronExpr: '*/10 * * * * *', // every 10 seconds
  async handler() {
    console.log('[job:example] Running example job');
  },
};
