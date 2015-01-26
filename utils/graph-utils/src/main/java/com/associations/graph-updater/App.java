package com.associations.graphupdater;

import java.sql.*;
import java.util.*;

/**
 * Hello world!
 *
 */
public class App
{
    public static final String DEFAULT_NEO4J_URL = "http://192.168.1.100:7474";
    public static final String PG_DB_HOST = "192.168.1.100";
    public static final String PG_DB_PORT = "5433";
    public static final String PG_DB_USER = "associations_dbuser";
    public static final String PG_DB_NAME = "associations";
    public static final String PG_DB_PASSWORD = "password1";

    public static String getNeo4jUrl() {
        String var =  System.getenv("NEO4J_URL");
        if(var == null || var.isEmpty()) {
            return DEFAULT_NEO4J_URL;
        }
        return var;
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

    public static void main( String[] args )
    {
        Connection neo4j_connection;
        Connection pg_connection;
        try {
            neo4j_connection = DriverManager.getConnection(App.getNeo4jUrl().replace("http://","jdbc:neo4j://"));
            pg_connection = DriverManager.getConnection("jdbc:postgresql://" + App.getPgDbHost() + ":" + App.getPgDbPort() + "/" + App.getPgDbName(),App.getPgDbUser(),App.getPgDbPassword());

            Statement st = pg_connection.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM graph_nodes");
            while (rs.next())
            {
                //add or update all nodes in neo4j
            }
            rs.close();
            st.close();

            Statement st = pg_connection.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM graph_rels");
            while (rs.next())
            {
                //add or update all relationships in neo4j
            }
            rs.close();
            st.close();

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }
}
