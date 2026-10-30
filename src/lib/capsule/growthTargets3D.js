/* eslint-disable */
// 3D growth targets – copied unchanged from evalznow-server src/controllers/tabulationTable.controller.js
// (Third Parameter model). Capsules use the same model with <PC1, PC2, PC3> instead of <RR, PR, AR>.
<<<<<<< HEAD
// Confirmed by Rick (video UI_Comments_03): same Third Parameter scripts for growth targets, IC, MSIP and ∆GEQ,
// passing PC1 → RRN, PC2 → PRN, PC3 → ARN.
=======
// NOTE (Capacity_Part7): "This logic for 3D growth targets will change a bit, discuss with Rick first."
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb

function FindRoots(a, b, c, d) {
  let roots = [];

  // check if a not equal to zero
  if (a !== 0) {
    var A = (27 * a * a * c - 9 * a * b * b) / (27 * a * a * a);
    var B = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
    var D = (B / 2) * (B / 2) + (A / 3) * (A / 3) * (A / 3);
    let x1;
    let x2;
    let x3;

    if (D >= 0) {
      x1 =
        -b / 3 / a +
        Math.cbrt(-B / 2 + Math.sqrt(D)) +
        Math.cbrt(-B / 2 - Math.sqrt(D));
      roots[0] = x1;
      return roots;
    } else {
      x1 =
        -b / 3 / a +
        2 *
        Math.sqrt(-A / 3) *
        Math.cos(
          (1 / 3) *
          Math.acos(-B / 2 / Math.sqrt(((((-A / 3) * -A) / 3) * -A) / 3))
        );
      x2 =
        -b / 3 / a +
        2 *
        Math.sqrt(-A / 3) *
        Math.cos(
          (2 * Math.PI) / 3 +
          (1 / 3) *
          Math.acos(-B / 2 / Math.sqrt(((((-A / 3) * -A) / 3) * -A) / 3))
        );
      x3 =
        -b / 3 / a +
        2 *
        Math.sqrt(-A / 3) *
        Math.cos(
          (2 * Math.PI) / 3 -
          (1 / 3) *
          Math.acos(-B / 2 / Math.sqrt(((((-A / 3) * -A) / 3) * -A) / 3))
        );
      roots[0] = x1;
      roots[1] = x2;
      roots[2] = x3;
      return roots;
    }
  }
  return roots;
}



function CalcGTSpecialCasesTM(rr, pr, ar) {
  let gt = [];
  let rrGt1 = 0;
  let prGt1 = 0;
  let arGt1 = 0;
  let rrGt2 = 0;
  let prGt2 = 0;
  let arGt2 = 0;
  let rrGt3 = 0;
  let prGt3 = 0;
  let arGt3 = 0;
  let rrGt4 = 0;
  let prGt4 = 0;
  let arGt4 = 0;
  let rrGt5 = 0;
  let prGt5 = 0;
  let arGt5 = 0;

  if (rr == 0 && pr == 1 && ar == 0) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;

    gt.push(rrGt1);
    gt.push(prGt1);
    gt.push(arGt1);

    rrGt2 = 0.4142;
    prGt2 = 1.0;
    arGt2 = 0.0;

    gt.push(rrGt2);
    gt.push(prGt2);
    gt.push(arGt2);

    rrGt3 = 0.6682;
    prGt3 = 1.0;
    arGt3 = 0.0;

    gt.push(rrGt3);
    gt.push(prGt3);
    gt.push(arGt3);

    rrGt4 = 1.0;
    prGt4 = 1.0;
    arGt4 = 0.0;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    rrGt5 = 1.0;
    prGt5 = 1.0;
    arGt5 = 0.5;

    gt.push(rrGt5);
    gt.push(prGt5);
    gt.push(arGt5);

    return gt;
  } else if (rr == 0 && pr == 1 && ar == 1) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;

    gt.push(rrGt1);
    gt.push(prGt1);
    gt.push(arGt1);

    rrGt2 = 0.4142;
    prGt2 = 1.0;
    arGt2 = 1.0;

    gt.push(rrGt2);
    gt.push(prGt2);
    gt.push(arGt2);

    rrGt3 = 0.6682;
    prGt3 = 1.0;
    arGt3 = 1.0;

    gt.push(rrGt3);
    gt.push(prGt3);
    gt.push(arGt3);

    rrGt4 = 1.0;
    prGt4 = 1.0;
    arGt4 = 1.0;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    rrGt5 = 1.0;
    prGt5 = 1.0;
    arGt5 = 1.0;

    gt.push(rrGt5);
    gt.push(prGt5);
    gt.push(arGt5);

    return gt;
  } else if (rr == 1 && pr == 0 && ar == 0) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;

    gt.push(rrGt1);
    gt.push(prGt1);
    gt.push(arGt1);

    rrGt2 = 1.0;
    prGt2 = 0.4142;
    arGt2 = 0.0;

    gt.push(rrGt2);
    gt.push(prGt2);
    gt.push(arGt2);

    rrGt3 = 1.0;
    prGt3 = 0.6682;
    arGt3 = 0.0;

    gt.push(rrGt3);
    gt.push(prGt3);
    gt.push(arGt3);

    rrGt4 = 1.0;
    prGt4 = 1.0;
    arGt4 = 0.0;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    rrGt5 = 1.0;
    prGt5 = 1.0;
    arGt5 = 0.5;

    gt.push(rrGt5);
    gt.push(prGt5);
    gt.push(arGt5);

    return gt;
  } else if (rr == 1 && pr == 0 && ar == 1) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;

    gt.push(rrGt1);
    gt.push(prGt1);
    gt.push(arGt1);

    rrGt2 = 1.0;
    prGt2 = 0.4142;
    arGt2 = 1.0;

    gt.push(rrGt2);
    gt.push(prGt2);
    gt.push(arGt2);

    rrGt3 = 1.0;
    prGt3 = 0.6682;
    arGt3 = 1.0;

    gt.push(rrGt3);
    gt.push(prGt3);
    gt.push(arGt3);

    rrGt4 = 1.0;
    prGt4 = 1.0;
    arGt4 = 1.0;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    rrGt5 = 1.0;
    prGt5 = 1.0;
    arGt5 = 1.0;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    return gt;
  } else if (rr == 0 && pr == 0 && ar == 1) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;

    gt.push(rrGt1);
    gt.push(prGt1);
    gt.push(arGt1);

    rrGt2 = 0.25;
    prGt2 = 0.25;
    arGt2 = 1.0;

    gt.push(rrGt2);
    gt.push(prGt2);
    gt.push(arGt2);

    rrGt3 = 0.5;
    prGt3 = 0.5;
    arGt3 = 1.0;

    gt.push(rrGt3);
    gt.push(prGt3);
    gt.push(arGt3);

    rrGt4 = 0.75;
    prGt4 = 0.75;
    arGt4 = 1.0;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    rrGt5 = 1.0;
    prGt5 = 1.0;
    arGt5 = 1.0;

    gt.push(rrGt5);
    gt.push(prGt5);
    gt.push(arGt5);

    return gt;
  } else if (rr == 1 && pr == 1 && ar == 0) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;

    gt.push(rrGt1);
    gt.push(prGt1);
    gt.push(arGt1);

    rrGt2 = 1.0;
    prGt2 = 1.0;
    arGt2 = 0.25;

    gt.push(rrGt2);
    gt.push(prGt2);
    gt.push(arGt2);

    rrGt3 = 1.0;
    prGt3 = 1.0;
    arGt3 = 0.5;

    gt.push(rrGt3);
    gt.push(prGt3);
    gt.push(arGt3);

    rrGt4 = 1.0;
    prGt4 = 1.0;
    arGt4 = 0.75;

    gt.push(rrGt4);
    gt.push(prGt4);
    gt.push(arGt4);

    rrGt5 = 1.0;
    prGt5 = 1.0;
    arGt5 = 1.0;

    gt.push(rrGt5);
    gt.push(prGt5);
    gt.push(arGt5);

    return gt;
  } else if (
    (rr == 0 && pr == 0 && ar == 0) ||
    (rr == 1 && pr == 1 && ar == 1)
  ) {
    rrGt1 = null;
    prGt1 = null;
    arGt1 = null;
    rrGt2 = null;
    prGt2 = null;
    arGt2 = null;
    rrGt3 = null;
    prGt3 = null;
    arGt3 = null;
    rrGt4 = null;
    prGt4 = null;
    arGt4 = null;
    rrGt5 = null;
    prGt5 = null;
    arGt5 = null;

    return gt;
  }

  return gt;
}



function CalcGT1(rr, pr, ar) {
  let gt1 = [];

  let eqn = 0;

  let r = 0;
  let rrGt1 = 0;
  let prGt1 = 0;
  let arGt1 = 0;

  eqn = parseFloat(
    Math.sqrt(Math.pow(rr, 2) + Math.pow(pr, 2) + Math.pow(ar, 2)).toFixed(3)
  );

  // projects the performance point to the interaction class surface ahead
  if (eqn >= 1.0) return gt1;
  else if (eqn < 1.0 && eqn > 0.9) r = 1.0;
  else if (eqn == 0.9) r = 1.0;
  else if (eqn < 0.9 && eqn > 0.8) r = 0.9;
  else if (eqn == 0.8) r = 0.9;
  else if (eqn < 0.8 && eqn > 0.7) r = 0.8;
  else if (eqn == 0.7) r = 0.8;
  else if (eqn < 0.7 && eqn > 0.6) r = 0.7;
  else if (eqn == 0.6) r = 0.7;
  else if (eqn < 0.6) r = 0.6;

  if (gt1[0] !== null && gt1[1] !== null && gt1[2] !== null) {
    // Special Case 1
    if (pr == 0 && rr == 0) {
      rrGt1 = 0.0;

      prGt1 = 0.0;

      arGt1 = r;

      gt1.push(rrGt1, prGt1, arGt1);

      return gt1;
    }

    // Special Case 2
    else if (rr == 0 && ar == 0) {
      rrGt1 = 0.0;

      prGt1 = r;

      arGt1 = 0.0;

      gt1.push(rrGt1, prGt1, arGt1);

      return gt1;
    }

    // Special Case 3
    else if (pr == 0 && ar == 0) {
      rrGt1 = r;

      prGt1 = 0.0;

      arGt1 = 0.0;

      gt1.push(rrGt1, prGt1, arGt1);

      return gt1;
    }

    // General Case for growth target 1
    else {
      rrGt1 =
        r * Math.pow(1 + (Math.pow(pr / rr, 2) + Math.pow(ar / rr, 2)), -0.5);

      prGt1 =
        r * Math.pow(1 + (Math.pow(rr / pr, 2) + Math.pow(ar / pr, 2)), -0.5);

      arGt1 =
        r * Math.pow(1 + (Math.pow(rr / ar, 2) + Math.pow(pr / ar, 2)), -0.5);

      gt1.push(rrGt1, prGt1, arGt1);

      return gt1;
    }
  } else {
    return gt1;
  }
  // return gt1;
}



function CalcGT2(rr, pr, ar) {
  let gt2 = [];

  var productiveLine = parseFloat(Math.tan((67.5 * Math.PI) / 180).toFixed(3));
  var balancedLine = parseFloat(Math.tan((45 * Math.PI) / 180).toFixed(3));
  var receptiveLine = parseFloat(Math.tan((22.5 * Math.PI) / 180).toFixed(3));

  var adjacentLine = "";
  var biasLine = false;
  var onCurve = false;
  var caseB = false;

  var slope = parseFloat((pr / rr).toFixed(3));
  let rrGt2 = 0;
  let prGt2 = 0;
  let arGt2 = 0;
  let eqn = 0;
  let r = 0;

  eqn = parseFloat(
    Math.sqrt(Math.pow(rr, 2) + Math.pow(pr, 2) + Math.pow(ar, 2)).toFixed(3)
  );

  // Checking for the Class Area On, Within, Above
  if (eqn > 1.0) {
    caseB = true;
  } else if (eqn == 1.0) {
    onCurve = true;
    r = 1.0;
  } else if (eqn < 1.0 && eqn > 0.9) {
    onCurve = true;
    r = 0.9;
  } else if (eqn == 0.9) {
    onCurve = true;
    r = 0.9;
  } else if (eqn < 0.9 && eqn > 0.8) {
    onCurve = true;
    r = 0.8;
  } else if (eqn == 0.8) {
    onCurve = true;
    r = 0.8;
  } else if (eqn < 0.8 && eqn > 0.7) {
    onCurve = true;
    r = 0.7;
  } else if (eqn == 0.7) {
    onCurve = true;
    r = 0.7;
  } else if (eqn < 0.7 && eqn > 0.6) {
    onCurve = true;
    r = 0.6;
  } else if (eqn == 0.6) {
    onCurve = true;
    r = 0.6;
  } else if (eqn < 0.6) {
    r = 0.6;
  }
  // Checking the point position for Productive, Balanced, Receptive bias lines
  if (slope > productiveLine) {
    adjacentLine = "productive";
    caseB = true;
  } else if (slope == productiveLine) {
    adjacentLine = "productive";
    biasLine = true;
  } else if (slope < productiveLine && slope > balancedLine) {
    adjacentLine = "productive" && gt2;
    // GT2 does not exist if point lies inside the productive area
  } else if ((slope == balancedLine) & gt2) {
  } else if (slope > receptiveLine && slope < balancedLine) {
    adjacentLine = "receptive" & gt2;
    // GT2 does not exist if point lies inside the receptive area
  } else if (slope == receptiveLine) {
    adjacentLine = "receptive";
    biasLine = true;
  } else if (slope < receptiveLine) {
    adjacentLine = "receptive";
    caseB = true;
  }

  if (gt2[0] !== null && gt2[1] !== null && gt2[2] !== null) {
    // Case A (If the previous point lies on any interaction class surface, then GT2 is the intersection point of the interaction class surface and the adjacent bias plane)
    if (onCurve) {
      if (adjacentLine == "productive") {
        rrGt2 =
          r * Math.pow(1 + Math.pow(Math.tan((67.5 * Math.PI) / 180), 2), -0.5);

        prGt2 = Math.tan((67.5 * Math.PI) / 180) * rrGt2;

        arGt2 = ar;

        gt2.push(rrGt2, prGt2, arGt2);

        return gt2;
      } else if (adjacentLine == "receptive") {
        rrGt2 =
          r * Math.pow(1 + Math.pow(Math.tan((22.5 * Math.PI) / 180), 2), -0.5);

        prGt2 = Math.tan((22.5 * Math.PI) / 180) * rrGt2;

        arGt2 = ar;

        gt2.push(rrGt2, prGt2, arGt2);

        return gt2;
      }
    }

    // Case B (If the previous point lies within the area above the interaction class surfaces on the outside of the adjacent bias plane)
    if (caseB) {
      if (adjacentLine == "productive") {
        rrGt2 = pr * (1 / Math.tan((67.5 * Math.PI) / 180));

        prGt2 = pr;

        arGt2 = ar;

        gt2.push(rrGt2, prGt2, arGt2);

        return gt2;
      } else if (adjacentLine == "receptive") {
        rrGt2 = rr;

        prGt2 = rr * Math.tan((22.5 * Math.PI) / 180);

        arGt2 = ar;

        gt2.push(rrGt2, prGt2, arGt2);

        return gt2;
      }
    }

    // Case C (If the previous point lies on the productive bias plane or the receptive bias plane, then GT2 is coincident with the previous point on the unit cube boundary)

    if (biasLine) {
      rrGt2 = rr;

      prGt2 = pr;

      arGt2 = ar;

      gt2.push(rrGt2, prGt2, arGt2);

      return gt2;
    }
  } else {
    return gt2;
  }

  return gt2;
}



function CalcGT3(rr, pr, ar) {
  let gt3 = [];

  var productiveLine = parseFloat(Math.tan((67.5 * Math.PI) / 180).toFixed(3));
  var balancedLine = parseFloat(Math.tan((45 * Math.PI) / 180).toFixed(3));
  var receptiveLine = parseFloat(Math.tan((22.5 * Math.PI) / 180).toFixed(3));

  var adjacentLine = "";
  var biasLine = false;
  var onCurve = false;
  var caseB = false;

  var slope = parseFloat((pr / rr).toFixed(3));

  let eqn = 0.0;
  let rrGt3 = 0;
  let prGt3 = 0;
  let arGt3 = 0;
  let r = 0.0;

  eqn = parseFloat(
    Math.sqrt(Math.pow(rr, 2) + Math.pow(pr, 2) + Math.pow(ar, 2)).toFixed(3)
  );
  // Checking for the Class Area On, Within, Above
  if (eqn > 1.01) {
    caseB = true;
  } else if (eqn == 1.0 || (eqn <= 1.01 && eqn > 1)) {
    onCurve = true;
    r = 1.0;
  } else if (eqn < 1.0 && eqn > 0.9) {
    onCurve = true;
    r = 0.9;
  } else if (eqn == 0.9) {
    onCurve = true;
    r = 0.9;
  } else if (eqn < 0.9 && eqn > 0.8) {
    onCurve = true;
    r = 0.8;
  } else if (eqn == 0.8) {
    onCurve = true;
    r = 0.8;
  } else if (eqn < 0.8 && eqn > 0.7) {
    onCurve = true;
    r = 0.7;
  } else if (eqn == 0.7) {
    onCurve = true;
    r = 0.7;
  } else if (eqn < 0.7 && eqn > 0.6) {
    onCurve = true;
    r = 0.6;
  } else if (eqn == 0.6) {
    onCurve = true;
    r = 0.6;
  } else if (eqn < 0.6) {
    r = 0.6;
  }

  // Checking the point position for Productive, Balanced, Receptive bias lines
  if (slope > productiveLine) {
    adjacentLine = "productive";
    caseB = true;
  } else if (slope == productiveLine) {
    adjacentLine = "productive";
    biasLine = true;
  } else if (slope < productiveLine && slope > balancedLine) {
    adjacentLine = "productive";
    // eslint-disable-next-line no-unused-expressions
    gt3[0] == null && gt3[1] == null && gt3[2] == null;
    // GT2 does not exist if point lies inside the productive area
  } else if (slope == balancedLine) {
    // eslint-disable-next-line no-unused-expressions
    gt3[0] == null && gt3[1] == null && gt3[2] == null;
  } else if (slope > receptiveLine && slope < balancedLine) {
    adjacentLine = "receptive";
    // eslint-disable-next-line no-unused-expressions
    gt3[0] == null && gt3[1] == null && gt3[2] == null;
    // GT2 does not exist if point lies inside the receptive area
  } else if (slope == receptiveLine) {
    adjacentLine = "receptive";
    biasLine = true;
  } else if (slope < receptiveLine) {
    adjacentLine = "receptive";
    caseB = true;
  }

  if (gt3[0] !== null && gt3[1] !== null && gt3[2] !== null) {
    // Case A (If GT2 lies on any interaction class surface, then GT3 is the midpoint between the adjacent bias plane and the balanced plane on the interaction class surface)
    if (onCurve) {
      if (adjacentLine == "productive") {
        rrGt3 =
          r *
          Math.pow(1 + Math.pow(Math.tan((56.25 * Math.PI) / 180), 2), -0.5);

        prGt3 = Math.tan((56.25 * Math.PI) / 180) * rrGt3;

        arGt3 = ar;

        gt3.push(rrGt3, prGt3, arGt3);

        return gt3;
      } else if (adjacentLine == "receptive") {
        rrGt3 =
          r *
          Math.pow(1 + Math.pow(Math.tan((33.75 * Math.PI) / 180), 2), -0.5);

        prGt3 = Math.tan((33.75 * Math.PI) / 180) * rrGt3;

        arGt3 = ar;

        gt3.push(rrGt3, prGt3, arGt3);

        return gt3;
      }
    }

    // Case B (If GT2 lies within the area above the interaction class surfaces, then GT3 is the horizontal midpoint between the adjacent bias plane and the balanced plane)
    if (caseB) {
      if (adjacentLine == "productive") {
        rrGt3 = (pr * 1) / Math.tan((56.25 * Math.PI) / 180);

        prGt3 = pr;

        arGt3 = ar;

        gt3.push(rrGt3, prGt3, arGt3);

        return gt3;
      } else if (adjacentLine == "receptive") {
        rrGt3 = rr;

        prGt3 = rr * Math.tan((33.75 * Math.PI) / 180);

        arGt3 = ar;

        gt3.push(rrGt3, prGt3, arGt3);

        return gt3;
      }
    }
  } else {
    return gt3;
  }

  return gt3;
}




function CalcGT4(rr, pr, ar) {
  let gt4 = [];

  var productiveLine = parseFloat(Math.tan((67.5 * Math.PI) / 180)).toFixed(3);
  var balancedLine = parseFloat(Math.tan((45.0 * Math.PI) / 180)).toFixed(3);
  var receptiveLine = parseFloat(Math.tan((22.5 * Math.PI) / 180)).toFixed(3);

  var adjacentLine = "";
  var onCurve = false;
  var caseB = false;
  var caseC = false;

  var slope = parseFloat(pr / rr).toFixed(3);

  let eqn = 0;
  let rrGt4 = 0;
  let prGt4 = 0;
  let arGt4 = 0;
  let r = 0;

  eqn = parseFloat(
    Math.sqrt(Math.pow(rr, 2) + Math.pow(pr, 2) + Math.pow(ar, 2)).toFixed(3)
  );

  // Checking for the Class Area On, Within, Above
  if (eqn > 1.01) {
    caseB = true;
  } else if (eqn == 1.0 || (eqn <= 1.01 && eqn > 1)) {
    onCurve = true;
    r = 1.0;
  } else if (eqn < 1.0 && eqn > 0.9) {
    onCurve = true;
    r = 0.9;
  } else if (eqn == 0.9) {
    onCurve = true;
    r = 0.9;
  } else if (eqn < 0.9 && eqn > 0.8) {
    onCurve = true;
    r = 0.8;
  } else if (eqn == 0.8) {
    onCurve = true;
    r = 0.8;
  } else if (eqn < 0.8 && eqn > 0.7) {
    onCurve = true;
    r = 0.7;
  } else if (eqn == 0.7) {
    onCurve = true;
    r = 0.7;
  } else if (eqn < 0.7 && eqn > 0.6) {
    onCurve = true;
    r = 0.6;
  } else if (eqn == 0.6) {
    onCurve = true;
    r = 0.6;
  } else if (eqn < 0.6) {
    r = 0.6;
  }

  // Checking the point position for Productive, Balanced, Receptive bias plane
  if (slope > productiveLine) {
    adjacentLine = "productive";
  } else if (slope == productiveLine) {
    adjacentLine = "productive";
  } else if (slope < productiveLine && slope > balancedLine) {
    adjacentLine = "productive";
    caseB = true;
  } else if (slope == balancedLine) {
    caseC = true;
    caseB = false;
  } else if (slope > receptiveLine && slope < balancedLine) {
    adjacentLine = "receptive";
    caseB = true;
  } else if (slope == receptiveLine) {
    adjacentLine = "receptive";
  } else if (slope < receptiveLine) {
    adjacentLine = "receptive";
  }

  if (gt4[0] !== null && gt4[1] !== null && gt4[2] !== null) {
    // Case A (If the previous point lies on any interaction class surface, then GT4 is the intersection point of the interaction class surface and the balance plane)
    if (onCurve) {
      rrGt4 = (Math.sqrt(2) / 2) * r;

      prGt4 = rrGt4;

      arGt4 = ar;

      gt4.push(rrGt4, prGt4, arGt4);

      return gt4;
    }

    // Case B (If the previous point lies within the area above the interaction class surfaces on the inside of the productive bias plane or the inside of the receptive bias plane)
    if (caseB) {
      if (adjacentLine == "productive") {
        rrGt4 = pr;

        prGt4 = pr;

        arGt4 = ar;

        gt4.push(rrGt4, prGt4, arGt4);

        return gt4;
      } else if (adjacentLine == "receptive") {
        rrGt4 = rr;

        prGt4 = rr;

        arGt4 = ar;

        gt4.push(rrGt4, prGt4, arGt4);

        return gt4;
      }
    }

    // Case C (If the previous point lies on the balance plane, then GT4 is coincident with the previous point on the unit cube boundary)

    if (caseC) {
      rrGt4 = rr;

      prGt4 = pr;

      arGt4 = ar;

      gt4.push(rrGt4, prGt4, arGt4);

      return gt4;
    }
  } else {
    return gt4;
  }

  return gt4;
}



function CalcGT5(rr, pr, ar) {
  let gt5 = [];

  var onCurve = false;
  var caseB = false;

  var r_0 = 0; // the interaction coefficient associated with the initial interaction class surface
  var r_f = 0; // the interaction coefficient associated with the forward interaction class surface.
  let rrGt5 = 0;
  let prGt5 = 0;
  let arGt5 = 0;
  let eqn = 0;

  eqn = parseFloat(
    Math.sqrt(Math.pow(rr, 2) + Math.pow(pr, 2) + Math.pow(ar, 2)).toFixed(3)
  );

  // Checking for the Class Area On, Within, Above
  if (eqn > 1.001) {
    caseB = true;
  } else if (eqn <= 1.001 && eqn > 0.9) {
    onCurve = true;
    r_0 = 0.9;
    r_f = 1.0;
  } else if (eqn == 0.9) {
    onCurve = true;
    r_0 = 0.9;
    r_f = 1.0;
  } else if (eqn < 0.9 && eqn > 0.8) {
    onCurve = true;
    r_0 = 0.8;
    r_f = 0.9;
  } else if (eqn == 0.8) {
    onCurve = true;
    r_0 = 0.8;
    r_f = 0.9;
  } else if (eqn < 0.8 && eqn > 0.7) {
    onCurve = true;
    r_0 = 0.7;
    r_f = 0.8;
  } else if (eqn == 0.7) {
    onCurve = true;
    r_0 = 0.7;
    r_f = 0.8;
  } else if (eqn < 0.7 && eqn > 0.6) {
    onCurve = true;
    r_0 = 0.6;
    r_f = 0.7;
  } else if (eqn == 0.6) {
    onCurve = true;
    r_0 = 0.6;
    r_f = 0.7;
  } else if (eqn < 0.6) {
    onCurve = true;
    r_0 = 0.6;
    r_f = 0.7;
  }

  // Case A (If GT4 lies on any interaction class surface, then GT5 is the midpoint between adjacent interaction class surfaces on the balanced plane)
  if (onCurve) {
    rrGt5 = 0.5 * ((Math.sqrt(2) / 2) * r_f + (Math.sqrt(2) / 2) * r_0);

    prGt5 = 0.5 * ((Math.sqrt(2) / 2) * r_f + (Math.sqrt(2) / 2) * r_0);

    arGt5 = 0.5 * ((Math.sqrt(2) / 2) * r_f + (Math.sqrt(2) / 2) * r_0);

    gt5.push(rrGt5, prGt5, arGt5);

    return gt5;
  }

  // Case B (If GT4 lies within the area above the interaction class surfaces, then GT5 is the midpoint between GT4 and maximum norm PP = < 1, 1, 1 > on the balanced plane)
  if (caseB) {
    rrGt5 = 0.5 * (pr + 1);

    prGt5 = 0.5 * (pr + 1);

    arGt5 = 0.5 * (pr + 1);

    gt5.push(rrGt5, prGt5, arGt5);

    return gt5;
  }

  return gt5;
}


const r3 = (v) => (v == null || Number.isNaN(v) ? null : +Number(v).toFixed(3));

/** Same as getGrowthTargetN(..., "Third Parameter") on the server: special cases first, else CalcGTN. */
export function getGrowthTarget3D(n, pc1, pc2, pc3) {
  const special = CalcGTSpecialCasesTM(pc1 ?? 0, pc2 ?? 0, pc3 ?? 0);
  if (special && special.length > 0) {
    return special.slice((n - 1) * 3, n * 3).map(r3);
  }
  const fn = [CalcGT1, CalcGT2, CalcGT3, CalcGT4, CalcGT5][n - 1];
  const gt = fn(pc1 ?? 0, pc2 ?? 0, pc3 ?? 0);
  if (!gt || gt.length < 3) return [null, null, null];
  return gt.map(r3);
}
