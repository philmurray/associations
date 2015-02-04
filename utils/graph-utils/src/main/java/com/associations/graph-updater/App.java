package com.associations.graphupdater;

import java.sql.*;
import java.util.*;

/**
 * Hello world!
 *
 */
public class App
{
    public static final String NEO4J_URL = "http://192.168.1.100:7474";
    public static final String PG_DB_HOST = "192.168.1.100";
    public static final String PG_DB_PORT = "5433";
    public static final String PG_DB_USER = "associations_dbuser";
    public static final String PG_DB_NAME = "associations";
    public static final String PG_DB_PASSWORD = "password1";

    public static String getNeo4jUrl() {
        String var =  System.getenv("NEO4J_URL");
        if(var == null || var.isEmpty()) {
            var = NEO4J_URL;
        }
        return var.replace("http://","jdbc:neo4j://");
    }

    public static String getPgUrl() {
        return "jdbc:postgresql://" + App.getPgDbHost() + ":" + App.getPgDbPort() + "/" + App.getPgDbName();
    }

    public static String getPgDbHost() {
        String var =  System.getenv("PG_DB_HOST");
        if(var == null || var.isEmpty()) {
            return PG_DB_HOST;
        }
        return var;
    }
    public static Integer getPgDbPort() {
        String var =  System.getenv("PG_DB_PORT");
        if(var == null || var.isEmpty()) {
            var = PG_DB_PORT;
        }
        return new Integer(var);
    }
    public static String getPgDbUser() {
        String var =  System.getenv("PG_DB_USER");
        if(var == null || var.isEmpty()) {
            return PG_DB_USER;
        }
        return var;
    }
    public static String getPgDbPassword() {
        String var =  System.getenv("PG_DB_PASSWORD");
        if(var == null || var.isEmpty()) {
            return PG_DB_PASSWORD;
        }
        return var;
    }
    public static String getPgDbName() {
        String var =  System.getenv("PG_DB_NAME");
        if(var == null || var.isEmpty()) {
            return PG_DB_NAME;
        }
        return var;
    }

    public static void main( String[] args ) throws Exception
    {
        Connection neo4j_connection = null;
        Connection pg_connection = null;
        Statement createConstraint = null;
        Statement createIndex = null;
        PreparedStatement updateNodes = null;
        PreparedStatement updateRels = null;
        Statement getNodes = null;
        Statement getRels = null;
        ResultSet nodes = null;
        ResultSet rels = null;

        try {
            System.out.println("connecting to databases: ");

            System.out.println(App.getNeo4jUrl());
            neo4j_connection = DriverManager.getConnection(App.getNeo4jUrl());
            System.out.println(App.getPgUrl());
            pg_connection = DriverManager.getConnection(App.getPgUrl(),App.getPgDbUser(),App.getPgDbPassword());

            System.out.println("creating constraints");
            createConstraint = neo4j_connection.createStatement();
            createConstraint.executeUpdate("CREATE CONSTRAINT ON (word:Word) ASSERT word.Text IS UNIQUE");
            createConstraint.close();

            System.out.println("creating indexes");
            createIndex = neo4j_connection.createStatement();
            createIndex.executeUpdate("CREATE INDEX ON :Word(text)");
            createIndex.close();

            neo4j_connection.setAutoCommit(false);


            System.out.println("updating nodes");
            updateNodes = neo4j_connection.prepareStatement("MERGE (word:Word { text: {1} })");
            getNodes = pg_connection.createStatement();
            nodes = getNodes.executeQuery("SELECT * FROM graph_nodes");
            while (nodes.next())
            {
                updateNodes.setString(1, nodes.getString("node"));
                updateNodes.executeUpdate();
            }
            updateNodes.close();
            nodes.close();
            getNodes.close();

            System.out.println("updating relationships");
            updateRels = neo4j_connection.prepareStatement("MATCH (from:Word { text: {1} }),(to:Word { text: {2}}) MERGE from-[r:Association {score:{3}}]->to");
            getRels = pg_connection.createStatement();
            rels = getRels.executeQuery("SELECT * FROM graph_rels");
            while (rels.next())
            {
                updateRels.setString(1, rels.getString("from"));
                updateRels.setString(2, rels.getString("to"));
                updateRels.setFloat(3, rels.getFloat("score"));
                updateRels.executeUpdate();
            }
            updateRels.close();
            rels.close();
            getRels.close();

            neo4j_connection.commit();

        } catch (SQLException e) {
            System.out.println(e.getMessage());
        } finally {
            if (neo4j_connection != null){
                neo4j_connection.close();
            }
            if (pg_connection != null){
                pg_connection.close();
            }
            if (createConstraint != null){
                createConstraint.close();
            }
            if (createIndex != null){
                createIndex.close();
            }
            if (updateNodes != null){
                updateNodes.close();
            }
            if (updateRels != null){
                updateRels.close();
            }
            if (getNodes != null){
                getNodes.close();
            }
            if (getRels != null){
                getRels.close();
            }
            if (nodes != null){
                nodes.close();
            }
            if (rels != null){
                rels.close();
            }

            neo4j_connection.setAutoCommit(true);
        }

    }
}
