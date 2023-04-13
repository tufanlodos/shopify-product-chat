import striptags from "striptags";

export function cosineSimilarity(A: number[], B: number[]) {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = dotproduct / (mA * mB);
  return similarity;
}

export function normalizeText(text: string) {
  // CAN BE BETTER:
  return striptags(text)
    .replace("..", ".")
    .replace(". .", ".")
    .replace("\n", "")
    .replace(/(\r\n|\n|\r)/gm, " ");
}
