import assert from "node:assert/strict";
import test from "node:test";
import {
  canDownloadApplicationFile,
  canRecordFunding,
  canReviewApplications,
  canViewApplication,
} from "../src/lib/authorization.ts";

test("only admins can review applications", () => {
  assert.equal(canReviewApplications("admin"), true);
  assert.equal(canReviewApplications("founder"), false);
  assert.equal(canReviewApplications("investor"), false);
});

test("only investors can record funding", () => {
  assert.equal(canRecordFunding("investor"), true);
  assert.equal(canRecordFunding("admin"), false);
  assert.equal(canRecordFunding("founder"), false);
});

test("founders can view only their own applications", () => {
  assert.equal(canViewApplication("founder", "founder-1", "founder-1", "pending"), true);
  assert.equal(canViewApplication("founder", "founder-2", "founder-1", "approved"), false);
  assert.equal(canViewApplication("admin", "admin-1", "founder-1", "pending"), true);
});

test("investors can view only approved applications", () => {
  assert.equal(canViewApplication("investor", "investor-1", "founder-1", "approved"), true);
  assert.equal(canViewApplication("investor", "investor-1", "founder-1", "pending"), false);
  assert.equal(canViewApplication("investor", "investor-1", "founder-1", "rejected"), false);
});

test("application files use the same visibility rules", () => {
  assert.equal(canDownloadApplicationFile("founder", "founder-1", "founder-1", "pending"), true);
  assert.equal(canDownloadApplicationFile("founder", "founder-2", "founder-1", "pending"), false);
  assert.equal(canDownloadApplicationFile("investor", "investor-1", "founder-1", "approved"), true);
  assert.equal(canDownloadApplicationFile("investor", "investor-1", "founder-1", "rejected"), false);
});
