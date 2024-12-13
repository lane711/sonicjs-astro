# SonicJs Headless CMS

## Overview
SonicJs is a headless CMS built on Astro and designed to run on Cloudflare. It provides a flexible and scalable solution for managing content, leveraging modern web technologies.

## Dedicated Documentation Website
Read the docs here [https://sonicjs.com]

## How Fast is "Blazingly" Fast?

| Platform      | Average Response Time | Difference |
| ----------- | ----------- | ----------- |
| Strapi      | 342.1ms       | - baseline - |
| Node + Postgres   | 320.2ms        | 1.06x Faster|
| SonicJs   | 52.7ms        | 6.4x Faster|


## Features
- **Built on Astro**: The Admin UI leverages the power of Astro for fast and optimized static site generation. You can also build you website/app on top on this repo for a single front end/back end/API deployment.
- **Cloudflare Integration**: Runs seamlessly on Cloudflare for enhanced performance and security.
- **React Support**: Integrates with React for building dynamic and interactive user interfaces.
- **Tailwind CSS**: Utilizes Tailwind CSS for rapid UI development.
- **Secure Authentication**: Implements secure authentication mechanisms using `@node-rs/argon2` and other crypto libraries.
- **Database Management**: Uses Drizzle ORM for database interactions and migrations.
- **User Management**: Manage users information including roles from the UI
- **Authentication**: Manage user registration/login from your app with the built in API endpoints.


## Getting Started

### Prerequisites
1. You will need a free Cloudflare account: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/lane711/sonicjs.git
   cd sonicjs
   npm install
   ```
1. Create your own wrangler.toml (Cloudflare configuration file) using the example:
   ```sh
   cp wrangler.example.toml wrangler.toml
   ```
1. Create your Cloudflare D1 database with the following command:
   ```sh
   npx wrangler d1 create sonicjs
   ```
   The output of the above command will include a database id, **copy it to your clipboard**.

1. Update your `wrangler.toml` file to inclde the datbase id from step #3. It should look something like this:
   ```sh
   [[d1_databases]]
   binding = "D1"
   database_name = "sonicjs"
   database_id = "ba4f63aa-161d-4d12-aca7-b59761701871"
   ```
1. Run the app:
   ```sh
   npm run dev
   ```
1. Visit the Admin UI in your browser:
   [http://localhost:4321](http://localhost:4321)
   ![Admin UI](https://sonicjs.com/images/sonicJs-admin-ui.png)
