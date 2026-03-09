START TRANSACTION;

ALTER TABLE "Members" ADD "lockerNumber" text;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260309195503_AddLockerNumberToMembers', '8.0.10');

COMMIT;

