export function successResponse(
  res,
  data = null,
  message = "Success",
  status = 200,
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res,
  message = "Something went wrong",
  status = 500,
  field = null,
  data= null,
) {
  return res.status(status).json({
      success: false,
      message,
      field,
      data,
  });
}
