export const healthcheckHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' })
  }
}
