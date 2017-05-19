ExampleAPI
===================
This api handles various rpc requests.

<strong>Version 1.0</strong>

---
* [Session.Login](#Session.Login)
* [Session.Logout](#Session.Logout)
* [Session.KeepAlive](#Session.KeepAlive)
* [User.Add](#User.Add)
* [User.Delete](#User.Delete)
* [User.GetAll](#User.GetAll)
---

Session.Login
-------------------
Creates a new session.

### Description
Authenticates the user using the provided credentials and creates a new session.

### Parameters
| Name            | Type   | Description                                   |
| --------------- | ------ | --------------------------------------------- |
| params          | object |                                               |
| params.name     | string | Name of the user to create a session for.     |
| params.password | string | Password of the user to create a session for. |

### Result
| Name                 | Type   | Description                          |
| -------------------- | ------ | ------------------------------------ |
| result               | object |                                      |
| result.session_token | string | Bearer token of the created session. |

### Errors
| Code | Message            | Description                           |
| ---- | ------------------ | ------------------------------------- |
| 1    | InvalidCredentials | The provided credentials are invalid. |

### Examples

#### Request
```json
{
    "jsonrpc": "2.0",
    "id": "6a675010aadf8",
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
    "id": "775608f6acc0a",
    "result": {
        "session_token": "123456890"
    }
}
```

Session.Logout
-------------------
Destroys an existing session.

### Description
Logs the user out and destroys his active session.

### Result
| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | number | Always 0.   |

### Errors
| Code | Message  | Description                 |
| ---- | -------- | --------------------------- |
| 2    | NotFound | Session could not be found. |

### Examples

#### Request
```json
{
    "jsonrpc": "2.0",
    "id": "9cc45ed765d7f",
    "method": "Session.Logout"
}
```

#### Response
```json
{
    "jsonrpc": "2.0",
    "id": "7c1f8eb4fcca6",
    "result": 0
}
```

Session.KeepAlive
-------------------
Refreshs an existing session.

### Description
Refreshs an existing session so that it keeps alive and doesn't time out. This method does nothing but refreshing the timeout.

### Result
| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | number | Always 0.   |

### Errors
| Code | Message  | Description                 |
| ---- | -------- | --------------------------- |
| 2    | NotFound | Session could not be found. |

### Examples

#### Request
```json
{
    "jsonrpc": "2.0",
    "id": "36491d5dbc40d",
    "method": "Session.KeepAlive"
}
```

#### Response
```json
{
    "jsonrpc": "2.0",
    "id": "adf5ff57157be",
    "result": 0
}
```

User.Add
-------------------
Adds a new user.

### Parameters
| Name            | Type   | Description                  |
| --------------- | ------ | ---------------------------- |
| params          | object |                              |
| params.name     | string | Name of the user to add.     |
| params.email    | string | Email of the user to add.    |
| params.password | string | Password of the user to add. |

### Result
| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | number | Always 0.   |

### Errors
| Code | Message        | Description                           |
| ---- | -------------- | ------------------------------------- |
| 3    | Already exists | A user with that name already exists. |

### Examples

#### Request
```json
{
    "jsonrpc": "2.0",
    "id": "b0bc436c4601a",
    "method": "User.Add",
    "params": {
        "name": "user",
        "email": "user@example.org",
        "password": "1234567890"
    }
}
```

#### Response
```json
{
    "jsonrpc": "2.0",
    "id": "3f3bfb4f5c4ff",
    "result": 0
}
```

User.Delete
-------------------
Deletes an existing user.

### Parameters
| Name        | Type   | Description              |
| ----------- | ------ | ------------------------ |
| params      | object |                          |
| params.name | string | Name of the user to add. |

### Result
| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | number | Always 0.   |

### Errors
| Code | Message   | Description                               |
| ---- | --------- | ----------------------------------------- |
| 2    | Not found | A user with that name could not be found. |

### Examples

#### Request
```json
{
    "jsonrpc": "2.0",
    "id": "b86851ac3e115",
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
    "id": "6e29f7e549e85",
    "result": 0
}
```

User.GetAll
-------------------
Returns all users.

### Description
This method returns an array with information about all existing users.

### Result
| Name             | Type   | Description                 |
| ---------------- | ------ | --------------------------- |
| result           | array  | List of all existing users. |
| result.[#]       | object | Information about a user.   |
| result.[#].name  | string | Name of the user.           |
| result.[#].email | string | Email of the user.          |

### Examples

#### Request
```json
{
    "jsonrpc": "2.0",
    "id": "9354f63c28f9f",
    "method": "User.GetAll"
}
```

#### Response
```json
{
    "jsonrpc": "2.0",
    "id": "e8568f86bcbf5",
    "result": [
        {
            "name": "user",
            "email": "user@example.org"
        }
    ]
}
```


