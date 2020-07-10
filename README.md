

<br />
<p align="center">
  <a href="https://github.com/yotieapp">
    <img src="docs/logo.png" alt="Logo" width="250" height="250">
  </a>

  <h3 align="center">Perhaps 🧐</h3>

  <p align="center">
    An awesome library for handling optional values and operations
  </p>
</p>

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [Why Use This?](#why-use-this)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)


<!-- GETTING STARTED -->
# Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.


## Installation


```sh
$ yarn add @yotie/perhaps
```

<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

```js
const user = { name: 'john Doe', age: 21 };

const age = Some(user.age);
const age2 = age.map(num => num * 2);

if (age2.hasValue) {
  console.log(`User has a doubled age of ${age2.value}`)
}

const update = Result.wrapAsync(() =>
  api.post('/user/1234', { age: age2.value }));

if (update.ok) {
  console.log('User has be updated: ', update.value.toJSON())
}
```

Here's and exmample on how to apply _perhaps_ around negative cases
```js
const user = None();

const addRoles = user.match(
  usr => {
    usr.roles = ['default', 'user:scope'];
    return usr;
  },
  _ => console.warn('No user information is available to display')
);

const authenticate = addRoles.toResult();

if (!authenticate.ok)
  console.log('Could not authenticate user', authenticate.reason)
```
_For more extensive examples, please refer to the [tests](https://example.com)_

## Why Use This?

Because Monads are awesome and dont need to be complicated.

There are many great README templates available on GitHub, however, I didn't find one that really suit my needs so I created this enhanced one. I want to create a README template so amazing that it'll be the last one you ever need.

Here's why:
* Your time should be focused on creating something amazing. A project that solves a problem and helps others
* You shouldn't be doing the same tasks over and over like creating a README from scratch
* You should element DRY principles to the rest of your life :smile:

Of course, no one template will serve all projects since your needs may be different. So I'll be adding more in the near future. You may also suggest changes by forking this repo and creating a pull request or opening an issue.

A list of commonly used resources that I find helpful are listed in the acknowledgements.

>! Note: Hightlight inspiration from expo result




# API

## Maybe
Maybe is a container dedicated for the handling of a data which might be missing. Typically, it is used for representation of optional values. It allows prevent usage of Nullable objects

### Maybe\<T\>(T value)
#### .hasValue
#### .isNone
#### .value
#### .map<T>(fn)
#### .match(fn, fn)
#### .toResult()

### Some(any value)

### None()


## Result
A result object represents the result of an operation that can either return a value successfully or fail. Typically we'd simply either return a value or throw an error, but sometimes we perform multiple operations as a batch, some of which may succeed and others fail. Since we can't simultaneously return values and throw errors, we instead return collections of result objects. This allows a batch operation to return values for successful operations and errors for failed ones without loss of information, namely the errors. (from expo/result)

### Result\<T\>(ResultStatus status, T value, string | Error)
#### Result.wrap\<T\>(T value)

### result(any value)
### resultAsync(Promise\<any\>)
### Success\<T\>(T value)
### Failure\<T\>(string | Error)

### Result.Ok\<T\>(T value)
### Result.Fail\<T\>(string | Error)
### Result.wrap\<T\>(T value)
### Result.wrapAsync\<T\>(T value)
### Result.match\<T\>(T value)
### Result.matchAsync\<T\>(T value)



<!-- ROADMAP -->
# Roadmap

See the [open issues](https://github.com/orgs/yotieapp/projects/1) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
# Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the Branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request


# Inspiration
- expo/results
- amonad



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=flat-square
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[product-screenshot]: images/screenshot.png