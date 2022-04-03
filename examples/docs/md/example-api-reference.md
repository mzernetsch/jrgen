# Example API

An example api which handles various rpc requests.
This api follows the json-rpc 2.0 specification. More information available at http://www.jsonrpc.org/specification.

<strong>Version 1.0</strong>

---

- [Session.Login](#Session.Login)
- [Session.Logout](#Session.Logout)
- [Session.KeepAlive](#Session.KeepAlive)
- [User.Add](#User.Add)
- [User.Delete](#User.Delete)
- [User.GetAll](#User.GetAll)

---

<a name="Session.Login"></a>

## Session.Login

Creates a new session.

### Description

Authenticates the user using the provided credentials and creates a new session.

### Parameters

| Name            | Type   | Constraints   | Description                                   |
| --------------- | ------ | ------------- | --------------------------------------------- |
| params          | object |               |                                               |
| params.name     | string | minLength="1" | Name of the user to create a session for.     |
| params.password | string | minLength="1" | Password of the user to create a session for. |

### Result

| Name                 | Type   | Constraints    | Description                               |
| -------------------- | ------ | -------------- | ----------------------------------------- |
| result               | object |                |                                           |
| result.session_token | string | minLength="1"  | Bearer token of the created session.      |
| result?.validity     | number | multipleOf="1" | Validity of the session token in seconds. |

### Errors

| Code | Message            | Description                           |
| ---- | ------------------ | ------------------------------------- |
| 1    | InvalidCredentials | The provided credentials are invalid. |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "Session.Login",
  "params": {
    "name": "admin",
    "password": "123456"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {
    "session_token": "123456890",
    "validity": 3600
  }
}
```

<a name="Session.Logout"></a>

## Session.Logout

Destroys an existing session.

### Result

| Name   | Type   | Constraints              | Description |
| ------ | ------ | ------------------------ | ----------- |
| result | number | minimum="0", maximum="0" | Always '0'. |

### Errors

| Code | Message  | Description                 |
| ---- | -------- | --------------------------- |
| 2    | NotFound | Session could not be found. |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "Session.Logout"
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": 0
}
```

<a name="Session.KeepAlive"></a>

## Session.KeepAlive

Refreshs an existing session.

### Description

Refreshs an existing session so that it keeps alive and doesn't time out. This method does nothing but refreshing the timeout.

### Result

| Name   | Type   | Constraints              | Description |
| ------ | ------ | ------------------------ | ----------- |
| result | number | minimum="0", maximum="0" | Always '0'. |

### Errors

| Code | Message  | Description                 |
| ---- | -------- | --------------------------- |
| 2    | NotFound | Session could not be found. |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "Session.KeepAlive"
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": 0
}
```

<a name="User.Add"></a>

## User.Add

Adds a new user.

### Parameters

| Name               | Type   | Constraints                    | Description                  |
| ------------------ | ------ | ------------------------------ | ---------------------------- |
| params             | object |                                |                              |
| params.name        |        |                                | Name of the user to add.     |
| params.name(0)     | string | minLength="1"                  |                              |
| params.name(1)     | number | multipleOf="1"                 |                              |
| params.email       |        |                                | Email of the user to add.    |
| params?.address    | array  |                                | Address of the user to add.  |
| params?.address[0] | number | minimum="1"                    | Address number.              |
| params?.address[1] | string | minLength="1"                  | Name of the street.          |
| params?.address[2] | string | enum="Street,Avenue,Boulevard" | Type of the street.          |
| params?.address[3] | string | enum="NW,NE,SW,SE"             | City quadrant of the address |
| params.password    | string | minLength="1"                  | Password of the user to add. |

### Result

| Name   | Type   | Constraints              | Description |
| ------ | ------ | ------------------------ | ----------- |
| result | number | minimum="0", maximum="0" | Always '0'. |

### Errors

| Code | Message        | Description                           |
| ---- | -------------- | ------------------------------------- |
| 3    | Already exists | A user with that name already exists. |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "User.Add",
  "params": {
    "name": "user",
    "email": "user@example.org",
    "address": [1600, "Pennsylvania", "Avenue", "NW"],
    "password": "1234567890"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": 0
}
```

<a name="User.Delete"></a>

## User.Delete

Deletes an existing user.

### Parameters

| Name           | Type   | Constraints                            | Description                 |
| -------------- | ------ | -------------------------------------- | --------------------------- |
| params         |        |                                        |                             |
| params(0)      | object | exclusive                              |                             |
| params(0).name | string | minLength="1", pattern="^(A\|B)\-.\*$" | Name of the user to delete. |
| params(1)      | object | exclusive                              |                             |
| params(1).id   | string | minLength="1"                          | Id of the user to delete.   |

### Result

| Name   | Type   | Constraints              | Description |
| ------ | ------ | ------------------------ | ----------- |
| result | number | minimum="0", maximum="0" | Always '0'. |

### Errors

| Code | Message   | Description                               |
| ---- | --------- | ----------------------------------------- |
| 2    | Not found | A user with that name could not be found. |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "User.Delete",
  "params": {
    "name": "user"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": 0
}
```

<a name="User.GetAll"></a>

## User.GetAll

Returns all users.

### Description

This method returns an array with information about all existing users.

### Result

| Name                            | Type   | Constraints                    | Description                  |
| ------------------------------- | ------ | ------------------------------ | ---------------------------- |
| result                          | array  |                                | List of all existing users.  |
| result[]                        | object |                                | Information about a user.    |
| result[].name                   | string | minLength="1"                  | Name of the user.            |
| result[].email                  | string | format="email"                 | Email of the user.           |
| result[].address                | array  |                                | Address of the user to add.  |
| result[].address[0:number]      | number | minimum="1"                    | Address number.              |
| result[].address[1:street_name] | string | minLength="1"                  | Name of the street.          |
| result[].address[2:street_type] | string | enum="Street,Avenue,Boulevard" | Type of the street.          |
| result[].address[3:direction]   | string | enum="NW,NE,SW,SE"             | City quadrant of the address |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "User.GetAll"
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": [
    {
      "name": "user",
      "email": "user@example.org",
      "address": [1600, "Pennsylvania", "Avenue", "NW"]
    }
  ]
}
```
