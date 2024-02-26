# package-algebra-js

Algebra package for the [Fōrmulæ](https://formulae.org) programming language.

Fōrmulæ is also a software framework for visualization, edition and manipulation of complex expressions, from many fields. The code for an specific field —i.e. arithmetics— is encapsulated in a single unit called a Fōrmulæ **package**.

This repository contains the source code for the **algebra package**. It contains functionality tu perform algebraic expression simplification.

Notice that creating a complete algebra system is not a trivial job. For now, this package includes a minimal set of operations, enought to perform operations with complex arithmetic.

The GitHub organization [formulae-org](https://github.com/formulae-org) encompasses the source code for the rest of packages, as well as the [web application](https://github.com/formulae-org/formulae-js).

<!--
Take a look at this [tutorial](https://formulae.org/?script=tutorials/Arithmetic) to know the capabilities of the Fōrmulæ arithmetic package.
-->

### Simplifications ###

* Double negatives: $--x = x$
* Negative of an addition: $-(a + b +c) = -a - b - c$
* Negative of a multiplication: $-(abc) = (-1)abc$
* Addition of an addition: $x + (a + b + c) + y) = x + a + b + c + y$
* Multiplication of mutiplication: $x(abc)y = xabcy$
* Multiplication of negatives: $a(-b)c = (-1)abc$, $(-a)(-b) = ab$
* Multiplication distributes over addition: $a(x + y) = ax + ay$
