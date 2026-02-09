ALTER TABLE users ADD COLUMN privacy_settings TEXT NOT NULL DEFAULT '{"location_precision":"exact","hide_fields":[]}';
