module PMD.SQLGen where

-- intercalate is a list transformation function to insert this first parameter between list elements in the
-- second parameter and concatenates the result. E.g.,
-- >>> intercalate ", " ["first", "second", "third"] ==> produce output "first, second, third"
import Data.List (intercalate)
import Control.Exception
import Data.String

-- define ToSQL interface class
class ToSQL a where
    toSQL :: a -> String

-- Define a new data type SQLType. deriving clause specifies that we want compiler to automatically generate
-- instances of the Eq and Show classes for SQLType type.
data SQLType = SQLVarchar | SQLBoolean | SQLInteger | SQLDate | SQLFloat deriving (Eq, Show)

-- define instance of TOSQL class to map SQLType string to database SQL type
instance ToSQL SQLType where
    toSQL SQLVarchar = "varchar"
    toSQL SQLBoolean = "boolean"
    toSQL SQLInteger = "bigint"
    toSQL SQLDate = "date"
    toSQL SQLFloat = "double precision"

-- define a data type SQLStatement
data SQLStatement = SQLCreate {
    tableName :: String,
    columns :: [(String, SQLType)]
}

-- define sqlQuote function
sqlQuote :: String -> String
sqlQuote a = "\"" ++ a ++ "\""

-- create ToSQL instance that converts SQLStatement to sql create table statement. cols is a list of tuples defined
-- as [(String, (SQLType, Bool))] where (fst col) is the table column name and (fst (snd col)) is the SQLType which
-- is converted to sql type by ToSQL function
-- map takes a function and a list and applies that function to every element in the list, \col is a lambda
-- expression to represent anonymous mapping function
instance ToSQL SQLStatement where
    toSQL (SQLCreate tn cols) = 
        "create table " ++ sqlQuote tn ++ " (" ++ intercalate ", " (map (\col ->
            sqlQuote (fst col) ++ " " ++ toSQL (snd col)) cols) ++ ")"
