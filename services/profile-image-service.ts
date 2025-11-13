import { PutObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

import {
  getR2BucketName,
  getR2Client,
  getR2PublicBaseUrl,
} from "@/config/r2"

const buildObjectKey = (userId: string, filename: string) => {
  const extension = filename.includes(".")
    ? filename.split(".").pop()
    : undefined
  const safeExtension = extension ? extension.toLowerCase() : "jpg"
  return `profiles/${userId}/${randomUUID()}.${safeExtension}`
}

const isImageFile = (type: string | undefined) =>
  Boolean(type && type.startsWith("image/"))

export const uploadProfileImage = async (
  userId: string,
  file: File,
): Promise<string> => {
  if (!file || file.size === 0) {
    throw new Error("업로드할 프로필 이미지를 선택해주세요.")
  }

  if (!isImageFile(file.type)) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.")
  }

  const client = getR2Client()
  const bucket = getR2BucketName()
  const publicBaseUrl = getR2PublicBaseUrl().replace(/\/$/, "")
  const key = buildObjectKey(userId, file.name)
  const body = Buffer.from(await file.arrayBuffer())

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
      ACL: "public-read",
    }),
  )

  return `${publicBaseUrl}/${key}`
}
