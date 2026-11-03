import assert from "node:assert/strict";
import { test } from "node:test";
import { fileExtension, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, mediaKindOf, MOV_ADVICE, validateMediaFile, validateVideoDuration } from "./media-rules.ts";

const file = (type: string, name: string, size = 1024) => ({ type, name, size });

test("article covers take images only", () => {
  assert.equal(validateMediaFile(file("image/webp", "sofa.webp"), "blog-cover"), null);
  assert.equal(validateMediaFile(file("video/mp4", "lobby.mp4"), "blog-cover"), "Choose a JPG, PNG, or WebP image.");
  assert.equal(validateMediaFile(file("image/svg+xml", "logo.svg"), "blog-cover"), "Choose a JPG, PNG, or WebP image.");
});

test("the gallery takes images and MP4 or WebM video, with a separate size limit for each", () => {
  assert.equal(validateMediaFile(file("video/mp4", "lobby.mp4", MAX_VIDEO_BYTES), "gallery"), null);
  assert.equal(validateMediaFile(file("video/webm", "lobby.webm"), "gallery"), null);
  assert.equal(validateMediaFile(file("video/mp4", "lobby.mp4", MAX_VIDEO_BYTES + 1), "gallery"), "Videos must be 50 MB or smaller.");
  assert.equal(validateMediaFile(file("image/png", "big.png", MAX_IMAGE_BYTES + 1), "gallery"), "Images must be 5 MB or smaller.");
  assert.equal(validateMediaFile(file("image/png", "empty.png", 0), "gallery"), "That file is empty.");
});

test("iPhone .mov clips get export advice, whatever type the browser reports", () => {
  assert.equal(validateMediaFile(file("video/quicktime", "IMG_0042.MOV"), "gallery"), MOV_ADVICE);
  assert.equal(validateMediaFile(file("", "IMG_0042.mov"), "gallery"), MOV_ADVICE);
});

test("kinds and extensions come from the type, falling back to the name", () => {
  assert.equal(mediaKindOf(file("video/webm", "a.webm")), "video");
  assert.equal(mediaKindOf(file("image/jpeg", "a.jpg")), "image");
  assert.equal(mediaKindOf(file("application/pdf", "a.pdf")), null);
  assert.equal(fileExtension(file("video/mp4", "clip")), "mp4");
  assert.equal(fileExtension(file("", "photo.JPEG")), "jpeg");
  assert.equal(fileExtension(file("", "noextension")), "");
});

test("videos must be readable and a minute or shorter", () => {
  assert.equal(validateVideoDuration(60.3), null);
  assert.match(validateVideoDuration(75) ?? "", /60 seconds or shorter\. This one is 75 seconds\./);
  assert.match(validateVideoDuration(Number.NaN) ?? "", /could not be read/);
});
