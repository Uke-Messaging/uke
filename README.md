![](https://pbs.twimg.com/media/FgldKUKWYAAhoXR?format=png&name=4096x4096)

# Uke Protocol Messaging App - Ionic 6

> :warning: WARNING: This is a PoC repo, not meant for production in any way, and requires a _lot_ more work to be considered viable at the moment.

[![Netlify Status](https://api.netlify.com/api/v1/badges/d610143c-dd14-4539-ae57-2251644fca39/deploy-status)](https://app.netlify.com/sites/uke/deploys)

The Uke Protocol is a p2p, completely distributed messaging protocol.

![](https://camo.githubusercontent.com/4a557746073a052a77aeebfd6375a00c7a5de8671ff1303b6050d8894d5bc27c/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3932323335303636383236343635323831302f313032373235383532393130383732313730342f53637265656e73686f745f323032322d31302d30355f61745f31322e33382e33315f504d2e706e67)
_How Uke Messages are transported and stored._

This implementation shows how one can use it to build a realtime chat app using nothing but blockchain technology.

It utilizes local cryptography and a Substrate blockchain instance to verify, send, and receive messages in real time. One can create users, create new conversations with them, and send them messages.

## Building

> :warning: At this time, only the web version is deemed totally stable.

It's best to have Ionic installed for this step, which is installable via npm. This is a Capacitor project, meaning it's capable of producing multiple types of builds:

```sh
npm install -g @ionic/cli
```

To build for web, run the following:

```sh
npm run build
```

You can then use the `www/` directory to deploy wherever.

### iOS and Android

For Android, ensure you have Android Studio installed on your system:

```sh
ionic capacitor build android
```

For iOS, make sure you have Xcode and CocoaPods installed on your system:

```sh
ionic capacitor build ios
```

## Using

Right now, the app is live at https://app.uke.chat - however, keep in mind it's an experimental server that is subject to resets and some instability.

The Substrate node instance is hosted at node.uke.chat.

## Testing

Testing locally, clone the repo and run the following:

```sh
npm install
ng test
```

To test with docker, build the included image:

```sh
docker build -t uke-test .
```

## Running

To serve the app locally for development purposes, clone it and run the following:

```sh
npm install
ionic serve
```
