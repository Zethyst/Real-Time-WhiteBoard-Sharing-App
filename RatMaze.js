function path(m, N, i, j, str, arr) {
  if (i === N - 1 && j === N - 1) {
    arr.push(str);
    return;
  } else if (i < 0 || i > N - 1 || j < 0 || j > N - 1 || m[i][j] === 0) {
    return;
  }
  //! Mark visited
  m[i][j] = 0;

  //! Explore all paths from this point
  path(m, N, i, j + 1, str + "R", arr); // !Going right
  path(m, N, i + 1, j, str + "D", arr); // !Going down
  path(m, N, i, j - 1, str + "L", arr); // !Going left
  path(m, N, i - 1, j, str + "U", arr); // !Going up

  //! Marking unvisited for backtracking
  m[i][j] = 1;
}
function findAllPaths(m) {
  let N = m.length;
  let pathArray = [];
  path(m, N, 0, 0, "", pathArray);
  return pathArray;
}

N = 4;
m = [
  [1, 0, 0, 0],
  [1, 1, 0, 1],
  [1, 1, 0, 0],
  [0, 1, 1, 1],
];
let result = findAllPaths(m);
console.log(result);
