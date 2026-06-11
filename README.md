# package-algebra-js

Algebra package for [Fōrmulæ](https://formulae.org) — the visual environment for **computing**, **composing**, and **conversing** with tree-structured expressions.

This repository contains the source code for the **algebra package**. It contains functionality tu perform algebraic expression simplification.

Notice that creating a complete algebra system is not a trivial job. For now, this package includes a minimal set of operations, enought to perform operations with complex arithmetic.

> Part of the [formulae-org](https://github.com/formulae-org) organization: the [web application](https://github.com/formulae-org/formulae-js) plus one repository per package.

### Simplifications ###

* Double negatives: $--x = x$
* Negative of an addition: $-(a + b +c) = -a - b - c$
* Negative of a multiplication: $-(abc) = (-1)abc$
* Addition of an addition: $x + (a + b + c) + y) = x + a + b + c + y$
* Multiplication of mutiplication: $x(abc)y = xabcy$
* Multiplication of negatives: $a(-b)c = (-1)abc$, $(-a)(-b) = ab$
* Multiplication distributes over addition: $a(x + y) = ax + ay$
