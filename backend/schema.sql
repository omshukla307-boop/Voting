-- Supabase PostgreSQL Schema for Voting Project

-- 1. Create Enum Types
CREATE TYPE enum_users_role AS ENUM ('admin', 'voter');
CREATE TYPE enum_users_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE enum_elections_level AS ENUM ('local', 'state', 'national');
CREATE TYPE enum_elections_status AS ENUM ('upcoming', 'live', 'ended');

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    "voterId" VARCHAR(50) PRIMARY KEY NOT NULL,
    "aadharNo" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "role" enum_users_role DEFAULT 'voter' NOT NULL,
    "gender" enum_users_gender NOT NULL,
    "mobileNo" VARCHAR(15) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Create Elections Table
CREATE TABLE IF NOT EXISTS "Elections" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "level" enum_elections_level DEFAULT 'local' NOT NULL,
    "state" VARCHAR(50),
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" enum_elections_status DEFAULT 'upcoming' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Create Candidates Table
CREATE TABLE IF NOT EXISTS "Candidates" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "party" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "electionId" INTEGER NOT NULL REFERENCES "Elections"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    "constituency" VARCHAR(255) NOT NULL,
    "constituencyType" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "voteCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Create Votes Table
CREATE TABLE IF NOT EXISTS "Votes" (
    "id" SERIAL PRIMARY KEY,
    "voterId" VARCHAR(50) NOT NULL REFERENCES "Users"("voterId") ON UPDATE CASCADE ON DELETE RESTRICT,
    "candidateId" INTEGER NOT NULL REFERENCES "Candidates"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    "electionId" INTEGER NOT NULL REFERENCES "Elections"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    "voteHash" VARCHAR(255) UNIQUE NOT NULL,
    "timeStamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_voter_election UNIQUE ("voterId", "electionId")
);
