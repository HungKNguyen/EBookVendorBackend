# EBookVendor (Notes)

## Frontend

### Frontend Routes (https://localhost:3000)
`\home`: Homepage - starting point 

`\login`: Log In page

`\signup`: Sign Up page

`\admin`: Admin Dashboard

`\admin\orders`: Show information about orders

`\admin\ebooks`: Show information about ebooks

`\admin\analytics`: Show information about statistics

`\profile`: More detailed profile about the user

`\book\:bookId`: Page to display a specific book

`\cart`: Current User Cart

`\checkout`: Check out page

`\orders`: Shows users previous orders and write review of the book

## Backend


### Data Schemas
User:
```
{
    "_id": String,
    "firstname": String,
    "lastname": String,
    "image": FilePath,
    "email": String,
    "FbOAuth": String,
    "GoogleOAuth": String,
    "AppleOAuth": String,
    "admin: Boolean,
    "favEBooks": [EBooks],
    "cart": [EBooks]
}
```
Comment:
```
{
    "_id": String,
    "user": User,
    "ebook": EBook,
    "rating": Numeric,
    "comment": String,
    "date": String
}
```
EBook:
```
{
    "_id": String,
    "name": String,
    "author": String,
    "image": FilePath,
    "price": Numeric,
    "description": String,
    "ISBN": String,
    "comments": [Comment]
}
```
Order:
```
{
    "_id": String,
    "user": User,
    "ebook": EBook,
    "date": String,
    "status": Boolean,
    "payment": String,
    "amount": Numeric
}
```
Review:
```
{
    _id: String,
    user: User,
    rating: Numberic,
    review: String,
    date: String
}
```
### Backend Routes (https://localhost:3001/api)

`\users`: GET request: Return information of all users - admin only

`\users\login`: POST request: Allow user to login to their account
