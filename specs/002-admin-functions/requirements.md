# Admin Functions Requirements

**Feature**: Admin Functions  
**Created**: 2026-08-10  
**Status**: Draft

## Overview
This document captures the administrative requirements for managing the loyalty program configuration, including loyalty tiers, earning rules, point expiration policies, and targeted promotions.

## Scope
The admin functions feature covers configuration and management actions performed by authorized administrative users. It does not include online payment processing or refund workflows.

## Primary User
- Admin user

## User Stories

### 1. Configure loyalty tiers and booking rules
An admin can define and update loyalty tier rules, including tier names, point thresholds, booking window durations, and tier perks.

### 2. Manage point rates and expiration policies
An admin can set points earning rates and define point expiration behavior for the loyalty program.

### 3. Create targeted promotions
An admin can create, schedule, and apply promotions to selected loyalty tiers or customer segments.

## Functional Requirements

- FR-001: Admin users must be able to create and update loyalty tier definitions, including tier name, required point threshold, booking window length, and tier-specific perks.
- FR-002: Admin users must be able to configure points earning rates and point expiration behavior for the loyalty program.
- FR-003: Admin users must be able to define targeted promotions and assign them to one or more loyalty tiers or customer segments.
- FR-004: The system must store and display active tier and promotion configurations in the admin control panel.
- FR-005: The system must allow admin users to activate, deactivate, or archive promotions without deleting their history.
- FR-006: Admin changes to tier rules, point policies, or promotions must be preserved and usable by the loyalty engine for customer-facing reward calculations.
- FR-007: The admin feature must exclude online payment and refund management from its scope.

## Business Rules

- Tier configurations must include a clear tier name, threshold, booking window, and associated perks.
- Point policy changes must be stored as active configuration values for the loyalty engine.
- Promotions must support targeted assignment to specific loyalty tiers or segments.
- Admin actions must be visible in the management interface for review and future reference.

## Acceptance Criteria

- An admin can create or update a loyalty tier and confirm the updated values in the admin interface.
- An admin can configure earning rates and expiration settings and see the updated policy reflected in the admin panel.
- An admin can create a promotion and assign it to the intended loyalty tiers or segments.
- An admin can activate or deactivate a promotion and confirm the state change without losing promotion history.

## Assumptions

- Admin users already have access to authentication and authorization controls for configuration screens.
- Existing customer and loyalty data models are available for the admin feature to reference.
- Tier and promotion configuration is managed through the existing admin interface rather than a separate external tool.

## Out of Scope

- Online payment processing
- Refund management
- Customer-facing checkout payment flows
