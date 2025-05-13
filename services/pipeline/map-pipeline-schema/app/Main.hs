module Main where

import System.Environment
import System.IO
import qualified Data.ByteString.Lazy as BSL
import qualified Data.ByteString as BS
import Data.ByteString.Lazy.Char8 (unpack)
import Data.Vector (Vector)
import qualified Data.Vector as V
import Data.Text (Text)
import qualified Data.Text as T
import Data.List (groupBy, sortOn)
import Data.Aeson (eitherDecodeFileStrict)
import PMD.SQLGen
import PMD.HEALMapping
import System.Exit (exitWith, ExitCode(ExitFailure))

main :: IO ()
main = do
    [inputFile, outputFile] <- getArgs
    -- putStrLn ("input: " ++ inputFile)
    -- putStrLn ("output: " ++ outputFile)
    -- inputFile is mapping.json, outputFile is tables.sql
    contents <- eitherDecodeFileStrict inputFile
    case contents of
      Left err -> do
        putStrLn ("cannot decode json " ++ err)
        exitWith (ExitFailure (-1))
      Right rowsL -> do
        -- tableHeal is defined in PMD.HEALMapping module
        -- group all column mapping info for same table, then map them into columns for the table
        -- and create SQL statement for creating the table
        let isSameTable a b = tableHeal a == tableHeal b
            tables = groupBy isSameTable (sortOn tableHeal rowsL)
        mapM (\table -> do
                 putStrLn "===table==="
                 mapM (\row -> putStrLn ("\t" ++ show row) ) table) tables    
        let sqls = map (\table ->
                    let tn = T.unpack (tableHeal (head table))
                        cols = map (\i -> (T.unpack (fieldNameHEAL i), dataType i)) table in
                        SQLCreate tn cols) tables ++
                        -- add creating two additional tables which are not included in mappings.json input file
                           [
                             SQLCreate "reviewer_organization" [("reviewer", SQLVarchar), ("organization", SQLVarchar)],
                             SQLCreate "name" [("table", SQLVarchar), ("column", SQLVarchar), ("index", SQLVarchar), ("id", SQLVarchar), ("description", SQLVarchar)]
                           ]
        withFile outputFile WriteMode $ \h ->
                  mapM_ (hPutStrLn h . ( ++ ";") . toSQL) sqls
