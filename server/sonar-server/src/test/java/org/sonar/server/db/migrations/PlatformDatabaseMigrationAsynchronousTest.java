/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.server.db.migrations;

import com.google.common.base.Throwables;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.junit.After;
import org.sonar.server.platform.Platform;
import org.sonar.server.ruby.RubyBridge;
import org.sonar.server.ruby.RubyDatabaseMigration;

import static org.mockito.Mockito.mock;

public class PlatformDatabaseMigrationAsynchronousTest {

  private ExecutorService pool = Executors.newFixedThreadPool(2);
  private ExecutorService delegate = Executors.newSingleThreadExecutor();
  /**
   * Implementation of execute wraps specified Runnable to add a delay of 200 ms before passing it
   * to a SingleThread executor to execute asynchronously.
   */
  private PlatformDatabaseMigrationExecutorService executorService = new PlatformDatabaseMigrationExecutorServiceAdaptor() {
    @Override
    public void execute(final Runnable command) {
      delegate.execute(new Runnable() {
        @Override
        public void run() {
          try {
            Thread.currentThread().wait(200);
          } catch (InterruptedException e) {
            Throwables.propagate(e);
          }
          command.run();
        }
      });
    }
  };
  private RubyDatabaseMigration rubyDatabaseMigration = mock(RubyDatabaseMigration.class);
  private RubyBridge rubyBridge = mock(RubyBridge.class);
  private Platform platform = mock(Platform.class);
  private PlatformDatabaseMigration underTest = new PlatformDatabaseMigration(rubyBridge, executorService, platform);

  @After
  public void tearDown() throws Exception {
    delegate.shutdownNow();
  }
}
