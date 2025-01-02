/*
Fōrmulæ algebra package. Module for reduction.
Copyright (C) 2015-2024 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

export class Algebra extends Formulae.ReductionPackage {};

/*
// --x   ->   x

Algebra.negativeOfNegative = async (negative, session) => {
	let arg = negative.children[0];
	
	if (arg.getTag() === "Math.Arithmetic.Negative") {
		negative.replaceBy(arg.children[0]);
		//session.log("Negative of negative are cancelled");
		return true;
	}
	
	return false; // Ok, forward to other forms of Negative
};

// - (x + y + z)   ->   -x - y - z

Algebra.negativeOfAddition = async (negative, session) => {
	let add = negative.children[0];
	
	if (add.getTag() === "Math.Arithmetic.Addition") {
		let neg;
		
		for (let i = 0, n = add.children.length; i < n; ++i) {
			neg = Formulae.createExpression("Math.Arithmetic.Negative");
			neg.addChild(add.children[i]);
			add.setChild(i, neg);
			
			await session.reduce(add.children[i]);
		}
		
		negative.replaceBy(add);
		
		return true;
	}
	
	return false;
};

// - (x y z)   ->   -1 x y z
// - (c x y)   ->   -c x y

Algebra.negativeOfMultiplication = async (negative, session) => {
	let mul = negative.children[0];
	
	if (mul.getTag() === "Math.Arithmetic.Multiplication") {
		let first = mul.children[0];
		
		if (first.isInternalNumber()) {
			first.set(
				"Value",
				first.get("Value").negate()
			);
		}
		else {
			mul.addChildAt(0, CanonicalArithmetic.number2InternalNumber(-1));
		}
		
		negative.replaceBy(mul);
		return true;
	}
	
	return false;
};

// [-]x * [-]y * [-]z
//        x y z     if number of negatives is even
//     -1 x y z     if number of negatives is odd)
//
// c * [-]y * [-]z
//      c y z       if number of negatives is even
//     -c y z       if number of negatives is odd)

Algebra.multiplicationNegatives = async (multiplication, session) => {
	let negatives = 0;
	
	for (let i = 0, n = multiplication.children.length; i < n; ++i) {
		if (multiplication.children[i].getTag() === "Math.Arithmetic.Negative") {
			multiplication.setChild(i, multiplication.children[i].children[0]);
			++negatives;
		}
	}
	
	if (negatives > 0 && (negatives % 2) === 1) {
		let first = multiplication.children[0];
		
		if (first.isInternalNumber()) {
			first.set(
				"Value",
				first.get("Value").negate()
			);
		}
		else {
			multiplication.addChildAt(0, CanonicalArithmetic.number2InternalNumber(-1));
		}
	}
	
	return false;
};

*/

// x * (y + z)   =>   xy + xz

Algebra.multiplicationDistributiveOverAddition = async (multiplication, session) => {
	for (let i = 0, n = multiplication.children.length; i < n; ++i) {
		if (multiplication.children[i].getTag() === "Math.Arithmetic.Addition") {
			let factors = multiplication.children[i];
			
			let a = Formulae.createExpression("Math.Arithmetic.Addition");
			let m;
			let j;
			
			for (let f = 0, F = factors.children.length; f < F; ++f) {
				m = Formulae.createExpression("Math.Arithmetic.Multiplication");
				m.addChild(factors.children[f].clone());
				
				for (j = 0; j < n; ++j) {
					if (j === i) continue;
					m.addChild(multiplication.children[j].clone());
				}
				
				a.addChild(m);
			}
			
			multiplication.replaceBy(a);
			await session.reduce(a);
			return true;
		}
	}
	
	return false;
};

// -x /  y   =>   - ( x / y )
//  x / -y   =>   - ( x / y )
// -x / -y   =>       x / y

/*
Algebra.divisionNegatives = async (division, session) => {
	let x = 0;
	
	let n = division.children[0];
	if (n.getTag() === "Math.Arithmetic.Negative") {
		n.replaceBy(n.children[0]);
		++x;
	}
	
	let d = division.children[1];
	if (d.getTag() === "Math.Arithmetic.Negative") {
		d.replaceBy(d.children[0]);
		++x;
	}
	
	if (x == 2) {
		await session.reduce(division);
		return true;
	}
	
	if (x == 1) {
		let negative = Formulae.createExpression("Math.Arithmetic.Negative");
		division.replaceBy(negative);
		negative.addChild(division);
		
		await session.reduce(division);
		await session.reduce(negative);
		
		return true;
	}
	
	return false; // Ok, forward to other forms of Division
};
*/

// x / 0   =>   Undefined
// x / 1   =>   x
// 0 / x   =>   0

Algebra.divisionZeroOne = async (division, session) => {
	let den = division.children[1];
	
	if (den.isInternalNumber()) {
		den = den.get("Value");
		
		if (den.isZero()) {
			division.replaceBy(Formulae.createExpression("Undefined"));
			return true;
		}
		
		if (den.isOne()) {
			division.replaceBy(division.children[0]);
			return true;
		}
	}
	
	let num = division.children[0];
	
	if (num.isInternalNumber()) {
		num = num.get("Value");
		
		if (num.isZero()) {
			division.replaceBy(division.children[0]);
			return true;
		}
	}
	
	return false; // Ok, forward to other forms of Division
};

// (numeric * X) / Y                 ->   numeric * (X / Y)
// X / (numeric * Y)                 ->   1/numeric * (X / Y)
// (numeric1 * X) / (numeric2 * Y)   ->   (numeric1 / numeric2) * (X / Y)

Algebra.divisionExtractNumerics = async (division, session) => {
	let numerator = division.children[0];
	let denominator = division.children[1];
	let n = null, d = null;
	
	// numerator
	if (
		numerator.getTag() === "Math.Arithmetic.Multiplication" &&
		numerator.children[0].isInternalNumber()
	) {
		n = numerator.children[0].get("Value");
		numerator.removeChildAt(0);
		
		if (numerator.children.length == 1) {
			numerator = numerator.children[0];
			division.setChild(0, numerator);
		}
	}
	
	// denominator
	if (
		denominator.getTag() === "Math.Arithmetic.Multiplication" &&
		denominator.children[0].isInternalNumber()
	) {
		d = denominator.children[0].get("Value");
		denominator.removeChildAt(0);
		
		if (denominator.children.length == 1) {
			denominator = denominator.children[0];
			division.setChild(1, denominator);
		}
	}
	
	// changes ?
	if (n !== null || d !== null) {
		let multiplication = Formulae.createExpression("Math.Arithmetic.Multiplication");
		
		division.replaceBy(multiplication);
		
		if (d === null) {
			multiplication.addChild(CanonicalArithmetic.createInternalNumber(n));
		}
		else {
			if (n === null) {
				n = CanonicalArithmetic.getIntegerOne(session);
			}
			
			multiplication.addChild(
				CanonicalArithmetic.createInternalNumber(
					CanonicalArithmetic.division(n, d, session)
				)
			);
		}
		
		multiplication.addChild(division);
		//session.log("Extraction of numeric factors from elements of division");
		
		if (n != null) {
			await session.reduce(numerator);
		}
		
		if (d != null) {
			await session.reduce(denominator);
		}
		
		await session.reduce(division);
		await session.reduce(multiplication);
		return true;
	}
	
	return false; // Ok, forward to other forms of Division
};

// number / x   ->   number * 1/x,     number != 1
// x / number   ->   1/number * x

Algebra.divisionExtractNumericsAlone = async (division, session) => {
	if (division.children[0].isInternalNumber()) { // the numerator is numeric
		let n = division.children[0].get("Value");
		if (n.isOne()) return false;
		
		division.replaceBy(
			Formulae.createExpression(
				"Math.Arithmetic.Multiplication",
				division.children[0],
				Formulae.createExpression(
					"Math.Arithmetic.Division",
					CanonicalArithmetic.createInternalNumber(CanonicalArithmetic.getIntegerOne(session)),
					division.children[1]
				)
			)
		);
		return true;
	}
	
	// only the denominator is numeric
	
	if (division.children[1].isInternalNumber()) {
		let d = division.children[1].get("Value");
		
		division.replaceBy(
			Formulae.createExpression(
				"Math.Arithmetic.Multiplication",
				CanonicalArithmetic.createInternalNumber(
					CanonicalArithmetic.division(
						CanonicalArithmetic.getIntegerOne(session),
						d,
						session
					)
				),
				division.children[0]
			)
		);
		return true;
	}
	
	return false;
};

// x ^ 0   ->   1
// x ^ 1   ->   x
// 0 ^ x   ->   0 or infinity (if x is negative) // NO, we cannot know the sign of the x expression
// 1 ^ x   ->   1

Algebra.exponentiationSpecials = async (exponentiation, session) => {
	let base     = exponentiation.children[0];
	let exponent = exponentiation.children[1];
	
	let e = exponent.isInternalNumber() ? exponent.get("Value") : null;
	
	if (e !== null) {
		// x ^ 0   ->   1
		if (e.isZero()) {
			exponentiation.replaceBy(
				CanonicalArithmetic.createInternalNumber(
					CanonicalArithmetic.isInteger(e) ? CanonicalArithmetic.getIntegerOne(session) : CanonicalArithmetic.getDecimalOne(session)
				)
			);
			return true;
		}
		
		// x ^ 1   ->   x
		if (e.isOne()) {
			exponentiation.replaceBy(base);
			return true;
		}
	}
	
	let b = base.isInternalNumber() ? base.get("Value") : null;
	
	if (b !== null) {
		// 0 ^ x   ->   0
		if (b.isZero()) {
			exponentiation.replaceBy(base);
			return true;
		}
		
		// 1 ^ x   ->   1
		if (b.isOne()) {
			exponentiation.replaceBy(base);
			return true;
		}
	}
	
	return false; // Ok, forward to other forms of Exponentiation
};

// (x * y * z) ^ int   ->   (x ^ int) * (y ^ int) * (z ^ int)
// (x   /   y) ^ int   ->   (x ^ int) / (y ^ int)

Algebra.exponentiationMultiplicationOrDivision = async (exponentiation, session) => {
	let base = exponentiation.children[0];
	let baseTag = base.getTag();
	
	if (baseTag === "Math.Arithmetic.Division" || baseTag === "Math.Arithmetic.Multiplication") {
		
		let exponent = exponentiation.children[1];
		
		// Integer number exponent only
		if (!(exponent.isInternalNumber() && CanonicalArithmetic.isInteger(exponent.get("Value")))) return false;
		
		let p;
		let i, n = base.children.length;
		for (i = 0; i < n; ++i) {
			p = Formulae.createExpression("Math.Arithmetic.Exponentiation");
			p.addChild(base.children[i]);
			p.addChild(exponent.clone());
			
			base.setChild(i, p);
		}
		
		exponentiation.replaceBy(base);
		//session.log("Exponentiation distributive over multiplication/division");
		
		for (i = 0; i < n; ++i) {
			await session.reduce(base.children[i]);
		}
		await session.reduce(base);
		
		return true;
	}
	
	return false; // Ok, forward to other forms of Exponentiation
};

Algebra.setReducers = () => {
	// No negatives in internal representation
	//ReductionManager.addReducer("Math.Arithmetic.Negative", Algebra.negativeOfNegative,       "Algebra.negativeOfNegative");
	//ReductionManager.addReducer("Math.Arithmetic.Negative", Algebra.negativeOfAddition,       "Algebra.negativeOfAddition");
	//ReductionManager.addReducer("Math.Arithmetic.Negative", Algebra.negativeOfMultiplication, "Algebra.negativeOfMultiplication");
	
	ReductionManager.addReducer("Math.Arithmetic.Addition", ReductionManager.itselfReducer, "ReductionManager.itselfReducer");
	
	ReductionManager.addReducer("Math.Arithmetic.Multiplication", ReductionManager.itselfReducer, "ReductionManager.itselfReducer");
	
	// No negatives in internal representation ReductionManager.addReducer("Math.Arithmetic.Multiplication", Algebra.multiplicationNegatives, "Algebra.multiplicationNegatives",                { symbolic: false });
	ReductionManager.addReducer("Math.Arithmetic.Multiplication", Algebra.multiplicationDistributiveOverAddition, "Algebra.multiplicationDistributiveOverAddition");
	
	// No negatives in internal representation ReductionManager.addReducer("Math.Arithmetic.Division", Algebra.divisionNegatives, "Algebra.divisionNegatives";
	ReductionManager.addReducer("Math.Arithmetic.Division", Algebra.divisionZeroOne,              "Algebra.divisionZeroOne"                                );
	ReductionManager.addReducer("Math.Arithmetic.Division", Algebra.divisionExtractNumerics,      "Algebra.divisionExtractNumerics");
	ReductionManager.addReducer("Math.Arithmetic.Division", Algebra.divisionExtractNumericsAlone, "Algebra.divisionExtractNumericsAlone");
	
	ReductionManager.addReducer("Math.Arithmetic.Exponentiation", Algebra.exponentiationSpecials, "Algebra.exponentiationSpecials");
	ReductionManager.addReducer("Math.Arithmetic.Exponentiation", Algebra.exponentiationMultiplicationOrDivision, "Algebra.exponentiationMultiplicationOrDivision");
};

