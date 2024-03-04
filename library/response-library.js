// Status Code 200 (GET)
const get200 = (res, data) => {
  return res.status(200).json({
    status: 200,
    message: 'Data is retrieved successfully!',
    data: data,
    status_code: '200'
  });
};

// Status Code 200 (DELETE)
const delete200 = (res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Data is deleted successfully!',
    status_code: '200'
  });
};

// Status Code 201 (POST)
const post201 = (res, data) => {
  return res.status(201).json({
    status: 'success',
    message: 'Data is created successfully!',
    data: data,
    status_code: '201'
  });
};

const postLogin201 = (res, user, token) => {
  return res.status(201).json({
    status: 'success',
    message: 'Data is created successfully!',
    user: user,
    access_token: token,
    status_code: '201'
  });
};

// Status Code 201 (PUT)
const put201 = (res, data) => {
  return res.status(201).json({
    status: 'success',
    message: 'Data is updated successfully!',
    data: data,
    status_code: '201'
  });
};

// Status Code 400 (GET, POST, PUT, DELETE)
const get400 = (res) => {
  return res.status(400).json({
    status: 'error',
    message: 'Bad Request!',
    status_code: '400'
  });
};

const getUser400 = (res) => {
  return res.status(400).json({
    status: 'error',
    message: 'User already existed!',
    status_code: '400'
  });
};

// Status Code 401 (GET, POST, PUT, DELETE)
const get401 = (res, message = null) => {
  return res.status(401).json({
    status: 'error',
    message: message != null ? message : 'Unauthorized!',
    status_code: '401'
  });
};

// Status Code 403 (GET, POST, PUT, DELETE)
const get403 = (res) => {
  return res.status(401).json({
    status: 'error',
    message: 'Forbidden!',
    status_code: '403'
  });
};

// Status Code 404 (GET, POST, PUT, DELETE)
const get404 = (res, things) => {
  return res.status(404).json({
    status: 'error',
    message: things + ' Not Found!',
    status_code: '404'
  });
};

const getList404 = (res, things, data) => {
  return res.status(404).json({
    status: 'error',
    message: things + ' Not Found!',
    data: data,
    status_code: '404'
  });
};

// Status Code 405 (GET, POST, PUT, DELETE)
const get405 = (res, data) => {
  return res.status(405).json({
    status: 'error',
    message: data,
    status_code: '405'
  });
};

// Status Code 422 (GET, POST, PUT, DELETE)
const get422 = (res, details = null) => {
  return res.status(422).json({
    status: 'error',
    message: 'Unprocessable Entity!',
    details: details,
    status_code: '422'
  });
};

// Status Code 500 (GET, POST, PUT, DELETE)
const get500 = (res) => {
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error!',
    status_code: '500'
  });
};

// Status Code 503 (GET, POST, PUT, DELETE)
const get503 = (res) => {
  return res.status(503).json({
    status: 'error',
    message: 'Service Unavailable!',
    status_code: '503'
  });
};

// Status Code 504 (GET, POST, PUT, DELETE)
const get504 = (res) => {
  return res.status(504).json({
    status: 'error',
    message: 'Gateway Timeout!',
    status_code: '504'
  });
};

// Status Code 505 (GET, POST, PUT, DELETE)
const get505 = (res) => {
  return res.status(505).json({
    status: 'error',
    message: 'HTTP Version Not Supported!',
    status_code: '505'
  });
};

// Status Code 507 (GET, POST, PUT, DELETE)
const get507 = (res) => {
  return res.status(507).json({
    status: 'error',
    message: 'Insufficient Storage!',
    status_code: '507'
  });
};

// Status Code 511 (GET, POST, PUT, DELETE)
const get511 = (res) => {
  return res.status(511).json({
    status: 'error',
    message: 'Network Authentication Required!',
    status_code: '511'
  });
};

// Status Code 520 (GET, POST, PUT, DELETE)
const get520 = (res) => {
  return res.status(520).json({
    status: 'error',
    message: 'Unknown Error!',
    status_code: '520'
  });
};

module.exports = {
  get200,
  delete200,
  post201,
  postLogin201,
  put201,
  get400,
  getUser400,
  get401,
  get403,
  get404,
  getList404,
  get405,
  get422,
  get500,
  get503,
  get504,
  get505,
  get507,
  get511,
  get520
};
