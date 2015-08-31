# Kuzzle - Cabble demo

##Description
Cabble is a life-changing web application (demo) for both taxis and their customers.

With Cabble, taxis can easily find customers, without paying booking companies fees. This money saving allow them to improve their level of service up to those of others private transportation companies.

Cabble eases customers life as well: they can now hail a taxi with their fingertip.

Stay tuned! Upcoming versions of Cabble will also include social functionalities like the possibility for customers to rate their taxis, to comment their ride, to share their trip to their favorite social network, and more!

<span>
<figure>
<a href="./docs/cabble-sketch.png" >
  <img src="./docs/cabble-sketch.png"  width="400" >
  </a >
  <figcaption style="width:300px;" >Cabble overview : A customer ask a taxi for a ride.</figcaption>  
</figure>
</span>


A brief overview  of Cabble can be found [here](./docs/overview.md).

A step-by-step tutorial can be found [here](./docs/tutorial.md).

#How to install Cabble

## Kuzzle + Demo package with Docker Compose

Prerequisites:

* [Docker](https://docs.docker.com/installation/#installation)
* [Docker Compose](https://docs.docker.com/compose/install/)

In this directory you can use the default `docker-compose.yml` with all you need for running Kuzzle container and this demo:

```
$ docker-compose up
```

Now, you can try to use the todolist at http://localhost

## How to run this demo without docker

* You need to have a running [Kuzzle](https://github.com/kuzzleio/kuzzle).
* Configure the `config.js` file for change the Kuzzle URL if you have changed the default Kuzzle installation
* You can directly open the `index.html` file in your browser.
 

# The three Authors

 * [Émilie Esposito](https://twitter.com/emilieesposito)
 * [Sébastien Cottinet](https://github.com/scottinet)
 * [Éric Alvernhe](https://github.com/Ealv)

# The three Cabble Dependancies :

 * [Bluebird](https://github.com/petkaantonov/bluebird) (For Promise Styling)
 * [localForage](https://mozilla.github.io/localForage) (For local storage persistency)
 * [Leafletjs](http://leafletjs.com/) (awesome library for drawing map with OpenStreetMap Database)

# Licence
This demo is published under the MIT licence